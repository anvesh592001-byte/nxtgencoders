-- Public, Instagram-style comments for every problem.

create table if not exists public.problem_comments (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 3000),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.problem_comment_likes (
  comment_id uuid not null references public.problem_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id,user_id)
);

create index if not exists problem_comments_problem_idx on public.problem_comments(problem_id,created_at);
create index if not exists problem_comment_likes_comment_idx on public.problem_comment_likes(comment_id);

create trigger problem_comments_updated before update on public.problem_comments for each row execute function public.set_updated_at();

alter table public.problem_comments enable row level security;
alter table public.problem_comment_likes enable row level security;

create policy problem_comments_public_read on public.problem_comments for select using (true);
create policy problem_comments_authenticated_insert on public.problem_comments for insert with check (author_id=auth.uid() and public.is_approved());
create policy problem_comments_owner_update on public.problem_comments for update using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy problem_comments_owner_or_staff_delete on public.problem_comments for delete using (author_id=auth.uid() or public.is_staff());
create policy problem_comment_likes_public_read on public.problem_comment_likes for select using (true);

create or replace function public.toggle_problem_comment_like(p_comment_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or not public.is_approved() then raise exception 'Approved account required'; end if;
  if not exists(select 1 from public.problem_comments where id=p_comment_id) then raise exception 'Comment not found'; end if;
  if exists(select 1 from public.problem_comment_likes where comment_id=p_comment_id and user_id=auth.uid()) then
    delete from public.problem_comment_likes where comment_id=p_comment_id and user_id=auth.uid();
  else
    insert into public.problem_comment_likes(comment_id,user_id) values(p_comment_id,auth.uid());
  end if;
end; $$;
revoke execute on function public.toggle_problem_comment_like(uuid) from public,anon;
grant execute on function public.toggle_problem_comment_like(uuid) to authenticated;

create or replace function public.enforce_problem_comment_rate() returns trigger
language plpgsql security definer set search_path=public as $$
declare recent integer;
begin
  if auth.uid() is null or not public.is_approved() then raise exception 'Approved account required'; end if;
  select count(*) into recent from public.problem_comments where author_id=auth.uid() and created_at>now()-interval '1 minute';
  if recent>=20 then raise exception 'Comment rate limit reached. Please slow down.'; end if;
  return new;
end; $$;
create trigger rate_problem_comments before insert on public.problem_comments for each row execute function public.enforce_problem_comment_rate();

create or replace function public.notify_problem_comment() returns trigger
language plpgsql security definer set search_path=public as $$
declare recipient uuid;
begin
  select author_id into recipient from public.problems where id=new.problem_id;
  if recipient<>new.author_id then
    insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
    values(recipient,new.author_id,'problem_comment','New comment on your problem',left(new.body,180),'problem_comment',new.id,'/problems/'||new.problem_id)
    on conflict do nothing;
  end if;
  insert into public.contribution_events(user_id,event_type,points,source_id)
  values(new.author_id,'problem_comment',2,new.id) on conflict do nothing;
  return new;
end; $$;
create trigger notify_problem_comment after insert on public.problem_comments for each row execute function public.notify_problem_comment();

create or replace view public.problem_feed with (security_invoker=true) as
select p.*,pr.display_name as author_name,pr.username::text as author_username,pr.avatar_url,
 (select count(*) from public.problem_solutions s where s.problem_id=p.id)::integer as solution_count,
 (select count(*) from public.problem_volunteers v where v.problem_id=p.id)::integer as volunteer_count,
 (select count(*) from public.problem_comments c where c.problem_id=p.id)::integer as comment_count
from public.problems p join public.profiles pr on pr.id=p.author_id;

alter table public.reports drop constraint if exists reports_content_type_check;
alter table public.reports add constraint reports_content_type_check check (content_type in ('idea','idea_comment','problem','problem_comment','solution','solution_comment','profile','project_update'));

do $$ begin
 alter publication supabase_realtime add table public.problem_comments;
exception when duplicate_object then null; end $$;
