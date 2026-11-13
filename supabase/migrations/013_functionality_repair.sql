-- Production functionality repair: reliable likes, idempotent submissions,
-- authoritative profile counters, contribution rollback, and Realtime coverage.
-- This migration is additive/non-destructive and preserves every existing row.

-- Stable request IDs make browser retries and rapid double submissions idempotent.
alter table public.ideas add column if not exists client_request_id uuid;
alter table public.idea_comments add column if not exists client_request_id uuid;

create unique index if not exists ideas_author_request_uidx
  on public.ideas(author_id,client_request_id)
  where client_request_id is not null;
create unique index if not exists idea_comments_author_request_uidx
  on public.idea_comments(author_id,client_request_id)
  where client_request_id is not null;
create index if not exists idea_comments_author_created_idx
  on public.idea_comments(author_id,created_at desc);

-- Likes are independent from monthly-arena votes, preserving the existing
-- competition ranking model while providing normal social likes everywhere.
create table if not exists public.idea_likes (
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id,user_id)
);
create index if not exists idea_likes_user_created_idx
  on public.idea_likes(user_id,created_at desc);

alter table public.idea_likes enable row level security;
drop policy if exists idea_likes_read on public.idea_likes;
drop policy if exists idea_likes_insert on public.idea_likes;
drop policy if exists idea_likes_delete on public.idea_likes;
create policy idea_likes_read on public.idea_likes for select using (true);
create policy idea_likes_insert on public.idea_likes for insert to authenticated
  with check (user_id=auth.uid() and public.is_approved());
create policy idea_likes_delete on public.idea_likes for delete to authenticated
  using (user_id=auth.uid() or public.is_admin());

-- One durable notification per liker/idea avoids notification spam if a user
-- unlikes and later likes the same idea again.
create unique index if not exists notifications_unique_idea_like_idx
  on public.notifications(user_id,actor_id,type,entity_id)
  where type='idea_like';

create or replace function public.toggle_idea_like(p_idea_id uuid)
returns table(liked boolean,like_count bigint)
language plpgsql
security definer
set search_path=public
as $$
declare
  actor uuid:=auth.uid();
  owner uuid;
begin
  if actor is null or not public.is_approved() then
    raise exception 'Approved account required';
  end if;

  select author_id into owner
  from public.ideas
  where id=p_idea_id and status<>'removed';
  if owner is null then raise exception 'Idea not found'; end if;

  -- Serialize toggles for this user/idea pair so the returned state and count
  -- always describe the committed row set.
  perform pg_advisory_xact_lock(hashtextextended(actor::text||':'||p_idea_id::text,0));

  if exists(select 1 from public.idea_likes where idea_id=p_idea_id and user_id=actor) then
    delete from public.idea_likes where idea_id=p_idea_id and user_id=actor;
  else
    insert into public.idea_likes(idea_id,user_id) values(p_idea_id,actor);
    if owner<>actor then
      insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
      values(owner,actor,'idea_like','Your idea received a like','A student liked your idea.','idea',p_idea_id,'/ideas/'||p_idea_id)
      on conflict do nothing;
    end if;
  end if;

  return query
  select
    exists(select 1 from public.idea_likes where idea_id=p_idea_id and user_id=actor),
    (select count(*)::bigint from public.idea_likes where idea_id=p_idea_id);
end;
$$;
revoke all on function public.toggle_idea_like(uuid) from public;
grant execute on function public.toggle_idea_like(uuid) to authenticated;

-- Prevent a reply from pointing at a comment from another idea.
create or replace function public.validate_idea_comment_parent()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if new.parent_id is not null and not exists(
    select 1 from public.idea_comments p
    where p.id=new.parent_id and p.idea_id=new.idea_id
  ) then
    raise exception 'Reply parent must belong to the same idea';
  end if;
  return new;
end;
$$;
drop trigger if exists validate_idea_comment_parent on public.idea_comments;
create trigger validate_idea_comment_parent
before insert or update of parent_id,idea_id on public.idea_comments
for each row execute function public.validate_idea_comment_parent();

-- Rebuild the feed from authoritative rows. Likes and comments are counted,
-- never manually incremented, so concurrent users cannot corrupt totals.
create or replace view public.idea_feed
with (security_invoker=true)
as
with metrics as (
  select i.id,i.author_id,i.competition_id,i.remix_of,i.title,i.short_description,
    i.detailed_explanation,i.problem_statement,i.proposed_solution,i.technology_stack,
    i.category,i.difficulty,i.attachment_path,i.status,i.created_at,i.updated_at,
    coalesce((select sum(v.value) from public.idea_votes v where v.idea_id=i.id),0)::integer as vote_score,
    (select count(*)::integer from public.idea_comments c where c.idea_id=i.id) as comment_count,
    (select count(*)::integer from public.idea_likes l where l.idea_id=i.id) as like_count,
    i.client_request_id
  from public.ideas i
  where i.status<>'removed'
), ranked as (
  select m.*,
    case when m.competition_id is not null then
      dense_rank() over(partition by m.competition_id order by m.vote_score desc,m.comment_count desc,m.created_at)
    else null end as rank
  from metrics m
)
select r.id,r.author_id,r.competition_id,r.remix_of,r.title,r.short_description,
  r.detailed_explanation,r.problem_statement,r.proposed_solution,r.technology_stack,
  r.category,r.difficulty,r.attachment_path,r.status,r.created_at,r.updated_at,
  r.vote_score,r.comment_count,r.rank,
  p.display_name as author_name,p.username::text as author_username,p.avatar_url,
  r.like_count,r.client_request_id
from ranked r
join public.profiles p on p.id=r.author_id;

grant select on public.idea_feed to anon,authenticated;

-- Profile statistics are derived directly from source records. "Posts" means
-- all authored community posts: ideas plus Problem Board posts.
create or replace view public.profile_contribution_stats
with (security_invoker=true)
as
select p.id,
  (select count(*)::integer from public.ideas i where i.author_id=p.id and i.status<>'removed') as ideas_posted,
  ((select count(*) from public.ideas i where i.author_id=p.id and i.status<>'removed')+
   (select count(*) from public.problems pr where pr.author_id=p.id))::integer as posts_created,
  (select count(*)::integer from public.idea_comments c where c.author_id=p.id) as comments_written,
  (select count(*)::integer from public.idea_likes l join public.ideas i on i.id=l.idea_id where i.author_id=p.id) as likes_received,
  (select count(*)::integer from public.idea_likes l where l.user_id=p.id) as likes_given,
  (select count(*)::integer from public.project_members pm where pm.user_id=p.id and pm.status='active') as projects_joined
from public.profiles p;

grant select on public.profile_contribution_stats to anon,authenticated;

-- Direct profile updates cannot alter protected totals. Nested, trusted trigger
-- updates can recompute them from contribution_events.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if auth.uid()=old.id and not public.is_admin() then
    new.role:=old.role;
    new.approval_status:=old.approval_status;
    if pg_trigger_depth()=1 then
      new.contribution_points:=old.contribution_points;
      new.current_streak:=old.current_streak;
      new.last_contribution_date:=old.last_contribution_date;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.sync_contribution_points(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.profiles p
  set contribution_points=coalesce((select sum(e.points) from public.contribution_events e where e.user_id=p_user_id),0)
  where p.id=p_user_id;
end;
$$;
revoke all on function public.sync_contribution_points(uuid) from public,anon,authenticated;

create or replace function public.remove_deleted_contribution()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare event_name text; owner uuid; source uuid;
begin
  if tg_table_name='ideas' then
    event_name:='published_idea'; owner:=old.author_id; source:=old.id;
  elsif tg_table_name='idea_comments' then
    event_name:='useful_discussion'; owner:=old.author_id; source:=old.id;
  elsif tg_table_name='problem_solutions' then
    event_name:='proposed_solution'; owner:=old.author_id; source:=old.id;
  elsif tg_table_name='project_members' then
    event_name:='project_member'; owner:=old.user_id; source:=old.project_id;
  else return old;
  end if;
  delete from public.contribution_events
  where user_id=owner and event_type=event_name and source_id=source;
  perform public.sync_contribution_points(owner);
  return old;
end;
$$;

drop trigger if exists remove_contribution_idea on public.ideas;
drop trigger if exists remove_contribution_comment on public.idea_comments;
drop trigger if exists remove_contribution_solution on public.problem_solutions;
drop trigger if exists remove_contribution_project_member on public.project_members;
create trigger remove_contribution_idea after delete on public.ideas
  for each row execute function public.remove_deleted_contribution();
create trigger remove_contribution_comment after delete on public.idea_comments
  for each row execute function public.remove_deleted_contribution();
create trigger remove_contribution_solution after delete on public.problem_solutions
  for each row execute function public.remove_deleted_contribution();
create trigger remove_contribution_project_member after delete on public.project_members
  for each row execute function public.remove_deleted_contribution();

-- Repair totals that earlier nested profile protection prevented from updating.
update public.profiles p
set contribution_points=coalesce((select sum(e.points) from public.contribution_events e where e.user_id=p.id),0);

alter table public.ideas replica identity full;
alter table public.idea_likes replica identity full;
alter table public.idea_comments replica identity full;

do $$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='ideas') then
    alter publication supabase_realtime add table public.ideas;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='idea_likes') then
    alter publication supabase_realtime add table public.idea_likes;
  end if;
end $$;
