-- NXTGENCODERS initial production schema
-- Run through Supabase CLI (`supabase db push`) or paste into the SQL editor once.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  username citext not null unique check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  avatar_url text,
  bio text check (char_length(bio) <= 400),
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  role text not null default 'student' check (role in ('student','moderator','admin')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','suspended','rejected')),
  contribution_points integer not null default 0 check (contribution_points >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_contribution_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz not null,
  submission_deadline timestamptz not null,
  voting_deadline timestamptz not null,
  status text not null default 'draft' check (status in ('draft','submission_open','voting_open','finalist_review','winner_selected','archived','cancelled')),
  rankings_frozen_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < submission_deadline and submission_deadline < voting_deadline)
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  competition_id uuid references public.competitions(id) on delete set null,
  remix_of uuid references public.ideas(id) on delete set null,
  title text not null check (char_length(title) between 3 and 120),
  short_description text not null check (char_length(short_description) between 10 and 280),
  detailed_explanation text not null check (char_length(detailed_explanation) between 10 and 10000),
  problem_statement text check (problem_statement is null or char_length(problem_statement) between 10 and 3000),
  proposed_solution text check (proposed_solution is null or char_length(proposed_solution) between 10 and 5000),
  technology_stack text[] not null default '{}' check (cardinality(technology_stack) <= 12),
  category text not null default 'Other',
  difficulty text not null default 'Beginner' check (difficulty in ('Beginner','Intermediate','Advanced','Moonshot')),
  attachment_path text,
  status text not null default 'published' check (status in ('draft','published','under_review','finalist','winner','in_development','completed','archived','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idea_votes (
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (idea_id,user_id)
);

create table public.vote_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('idea','comment','solution')),
  entity_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.idea_comments(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 5000),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comment_votes (
  comment_id uuid not null references public.idea_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null default 1 check (value = 1),
  created_at timestamptz not null default now(),
  primary key (comment_id,user_id)
);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,idea_id)
);

create table public.competition_finalists (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  rank smallint not null check (rank between 1 and 3),
  frozen_score integer not null,
  discussion_count integer not null default 0,
  selected_at timestamptz not null default now(),
  unique (competition_id,idea_id),
  unique (competition_id,rank)
);

create table public.competition_results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null unique references public.competitions(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete restrict,
  selected_by uuid not null references public.profiles(id) on delete restrict,
  selected_at timestamptz not null default now(),
  announcement text not null check (char_length(announcement) between 20 and 3000),
  reason text not null check (char_length(reason) between 20 and 3000)
);

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 10000),
  affected_people text check (affected_people is null or char_length(affected_people) between 10 and 2000),
  importance text check (importance is null or char_length(importance) between 10 and 3000),
  current_solutions text check (current_solutions is null or char_length(current_solutions) <= 4000),
  category text not null default 'Other',
  attachment_path text,
  status text not null default 'Open' check (status in ('Open','Under Discussion','Solution Proposed','Solution Accepted','In Development','Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.problem_solutions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  explanation text not null check (char_length(explanation) between 40 and 7000),
  implementation_approach text not null check (char_length(implementation_approach) between 20 and 4000),
  technology_stack text[] not null default '{}',
  expected_outcome text not null check (char_length(expected_outcome) between 10 and 2000),
  is_accepted boolean not null default false,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.solution_votes (
  solution_id uuid not null references public.problem_solutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null default 1 check (value = 1),
  created_at timestamptz not null default now(),
  primary key (solution_id,user_id)
);

create table public.solution_comments (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid not null references public.problem_solutions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.problem_volunteers (
  problem_id uuid not null references public.problems(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_interest text not null default 'Contributor' check (char_length(role_interest) <= 120),
  created_at timestamptz not null default now(),
  primary key (problem_id,user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  source_idea_id uuid unique references public.ideas(id) on delete set null,
  source_problem_id uuid references public.problems(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  leader_id uuid not null references public.profiles(id) on delete restrict,
  technology_stack text[] not null default '{}',
  github_url text,
  demo_url text,
  status text not null default 'Planning' check (status in ('Planning','Recruiting','In Development','Testing','Completed','Archived')),
  progress smallint not null default 0 check (progress between 0 and 100),
  development_goals text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_role text not null default 'Contributor',
  is_leader boolean not null default false,
  status text not null default 'active' check (status in ('active','inactive','removed')),
  joined_at timestamptz not null default now(),
  primary key (project_id,user_id)
);

create table public.project_join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 5 and 2000),
  skills_offered text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id,user_id)
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','review','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_date date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null check (char_length(body) between 5 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id uuid,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index notifications_dedupe_idx on public.notifications(user_id,type,actor_id,entity_id) nulls not distinct;

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null default 'award',
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  source_id uuid,
  awarded_at timestamptz not null default now(),
  unique (user_id,achievement_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('idea','idea_comment','problem','solution','solution_comment','profile','project_update')),
  content_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed','escalated')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  moderator_notes text,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contribution_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  points integer not null,
  source_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id,event_type,source_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- Indexes for feeds, joins, moderation and pagination
create index ideas_author_idx on public.ideas(author_id,created_at desc);
create index ideas_competition_idx on public.ideas(competition_id,created_at desc) where competition_id is not null;
create index ideas_category_idx on public.ideas(category,created_at desc);
create index ideas_search_idx on public.ideas using gin(to_tsvector('english', title || ' ' || short_description));
create index idea_votes_idea_idx on public.idea_votes(idea_id,value);
create index comments_idea_idx on public.idea_comments(idea_id,created_at);
create index comments_parent_idx on public.idea_comments(parent_id) where parent_id is not null;
create index problems_created_idx on public.problems(created_at desc);
create index problems_status_idx on public.problems(status,created_at desc);
create index solutions_problem_idx on public.problem_solutions(problem_id,created_at desc);
create index project_members_user_idx on public.project_members(user_id);
create index project_tasks_project_idx on public.project_tasks(project_id,status);
create index notifications_user_idx on public.notifications(user_id,read_at,created_at desc);
create index reports_status_idx on public.reports(status,created_at desc);
create index contribution_user_time_idx on public.contribution_events(user_id,created_at desc);
create index vote_activity_user_time_idx on public.vote_activity(user_id,created_at desc);

-- Generic helpers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger competitions_updated before update on public.competitions for each row execute function public.set_updated_at();
create trigger ideas_updated before update on public.ideas for each row execute function public.set_updated_at();
create trigger comments_updated before update on public.idea_comments for each row execute function public.set_updated_at();
create trigger problems_updated before update on public.problems for each row execute function public.set_updated_at();
create trigger solutions_updated before update on public.problem_solutions for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.project_tasks for each row execute function public.set_updated_at();
create trigger updates_updated before update on public.project_updates for each row execute function public.set_updated_at();
create trigger announcements_updated before update on public.announcements for each row execute function public.set_updated_at();

create or replace function public.current_role() returns text
language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid(); $$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path=public as $$ select coalesce(public.current_role() in ('moderator','admin'),false); $$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public as $$ select coalesce(public.current_role()='admin',false); $$;
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and approval_status='approved'); $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare base_username text; approved text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), '[^a-zA-Z0-9_]', '', 'g'));
  approved := case when coalesce((new.raw_user_meta_data->>'domain_verified')::boolean,false) then 'approved' else 'pending' end;
  insert into public.profiles(id,display_name,username,approval_status)
  values(new.id,coalesce(new.raw_user_meta_data->>'display_name','NIAT Builder'),base_username,approved);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() = old.id and not public.is_admin() then
   new.role := old.role; new.approval_status := old.approval_status;
   new.contribution_points := old.contribution_points; new.current_streak := old.current_streak;
 end if;
 return new;
end; $$;
create trigger protect_profile before update on public.profiles for each row execute function public.protect_profile_fields();

create or replace function public.protect_idea_system_fields() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() = old.author_id and not public.is_staff() then
   new.author_id:=old.author_id; new.competition_id:=old.competition_id; new.status:=old.status; new.remix_of:=old.remix_of;
 end if; return new;
end; $$;
create trigger protect_idea before update on public.ideas for each row execute function public.protect_idea_system_fields();

-- Read models; totals are always derived, never client-maintained.
create or replace view public.idea_feed with (security_invoker=true) as
with metrics as (
 select i.*,
   coalesce((select sum(v.value) from public.idea_votes v where v.idea_id=i.id),0)::integer as vote_score,
   (select count(*) from public.idea_comments c where c.idea_id=i.id)::integer as comment_count
 from public.ideas i where i.status <> 'removed'
), ranked as (
 select m.*, case when competition_id is not null then dense_rank() over(partition by competition_id order by vote_score desc, comment_count desc, created_at asc) end as rank
 from metrics m
)
select r.*,p.display_name as author_name,p.username::text as author_username,p.avatar_url
from ranked r join public.profiles p on p.id=r.author_id;

create or replace view public.problem_feed with (security_invoker=true) as
select p.*,pr.display_name as author_name,pr.username::text as author_username,pr.avatar_url,
 (select count(*) from public.problem_solutions s where s.problem_id=p.id)::integer as solution_count,
 (select count(*) from public.problem_volunteers v where v.problem_id=p.id)::integer as volunteer_count
from public.problems p join public.profiles pr on pr.id=p.author_id;

create or replace view public.project_feed with (security_invoker=true) as
select p.*,pr.display_name as leader_name,
 (select count(*) from public.project_members m where m.project_id=p.id and m.status='active')::integer as member_count
from public.projects p join public.profiles pr on pr.id=p.leader_id;

-- Vote operations are the only mutation path for vote tables.
create or replace function public.cast_idea_vote(p_idea_id uuid,p_value smallint) returns void
language plpgsql security definer set search_path=public as $$
declare idea_author uuid; comp_status text; deadline timestamptz; recent integer;
begin
 if auth.uid() is null or not public.is_approved() then raise exception 'Approved account required'; end if;
 if p_value not in (-1,0,1) then raise exception 'Invalid vote'; end if;
 select i.author_id,c.status,c.voting_deadline into idea_author,comp_status,deadline
 from public.ideas i left join public.competitions c on c.id=i.competition_id where i.id=p_idea_id and i.status<>'removed';
 if not found then raise exception 'Idea not found'; end if;
 if idea_author=auth.uid() then raise exception 'You cannot vote on your own idea'; end if;
 if comp_status is not null and (comp_status not in ('submission_open','voting_open') or now()>deadline) then raise exception 'Voting is closed for this competition'; end if;
 select count(*) into recent from public.vote_activity where user_id=auth.uid() and created_at>now()-interval '1 minute';
 if recent>=30 then raise exception 'Vote rate limit reached. Try again shortly.'; end if;
 insert into public.vote_activity(user_id,entity_type,entity_id) values(auth.uid(),'idea',p_idea_id);
 if p_value=0 then delete from public.idea_votes where idea_id=p_idea_id and user_id=auth.uid();
 else insert into public.idea_votes(idea_id,user_id,value) values(p_idea_id,auth.uid(),p_value)
   on conflict(idea_id,user_id) do update set value=excluded.value,updated_at=now(); end if;
 if p_value=1 then
  insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
  values(idea_author,auth.uid(),'idea_upvote','Your idea received an upvote','A student supported your idea.','idea',p_idea_id,'/ideas/'||p_idea_id)
  on conflict do nothing;
 end if;
end; $$;

create or replace function public.cast_comment_vote(p_comment_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare owner uuid; idea uuid;
begin
 if not public.is_approved() then raise exception 'Approved account required'; end if;
 select author_id,idea_id into owner,idea from public.idea_comments where id=p_comment_id;
 if owner=auth.uid() then raise exception 'You cannot vote on your own comment'; end if;
 if exists(select 1 from public.comment_votes where comment_id=p_comment_id and user_id=auth.uid()) then
  delete from public.comment_votes where comment_id=p_comment_id and user_id=auth.uid();
 else
  insert into public.comment_votes(comment_id,user_id) values(p_comment_id,auth.uid());
 end if;
end; $$;

create or replace function public.cast_solution_vote(p_solution_id uuid,p_value smallint default 1) returns void
language plpgsql security definer set search_path=public as $$
declare owner uuid; problem uuid;
begin
 if not public.is_approved() then raise exception 'Approved account required'; end if;
 select author_id,problem_id into owner,problem from public.problem_solutions where id=p_solution_id;
 if owner=auth.uid() then raise exception 'You cannot vote on your own solution'; end if;
 if exists(select 1 from public.solution_votes where solution_id=p_solution_id and user_id=auth.uid()) then
  delete from public.solution_votes where solution_id=p_solution_id and user_id=auth.uid();
 else insert into public.solution_votes(solution_id,user_id,value) values(p_solution_id,auth.uid(),1); end if;
end; $$;

create or replace function public.accept_problem_solution(p_problem_id uuid,p_solution_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare problem_owner uuid; solution_owner uuid;
begin
 select author_id into problem_owner from public.problems where id=p_problem_id for update;
 if auth.uid()<>problem_owner and not public.is_staff() then raise exception 'Only the problem author or staff can accept a solution'; end if;
 select author_id into solution_owner from public.problem_solutions where id=p_solution_id and problem_id=p_problem_id;
 if solution_owner is null then raise exception 'Solution does not belong to this problem'; end if;
 update public.problem_solutions set is_accepted=false,accepted_at=null where problem_id=p_problem_id;
 update public.problem_solutions set is_accepted=true,accepted_at=now() where id=p_solution_id;
 update public.problems set status='Solution Accepted' where id=p_problem_id;
 insert into public.contribution_events(user_id,event_type,points,source_id) values(solution_owner,'accepted_solution',40,p_solution_id) on conflict do nothing;
 insert into public.user_achievements(user_id,achievement_id,source_id)
 select solution_owner,id,p_solution_id from public.achievements where slug='problem-solver' on conflict do nothing;
 insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
 values(solution_owner,auth.uid(),'solution_accepted','Your solution was accepted','The problem author selected your proposal.','problem',p_problem_id,'/problems/'||p_problem_id) on conflict do nothing;
end; $$;

create or replace function public.advance_competition(p_competition_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare current_status text;
begin
 if not public.is_admin() then raise exception 'Admin required'; end if;
 select status into current_status from public.competitions where id=p_competition_id for update;
 if current_status='submission_open' then update public.competitions set status='voting_open' where id=p_competition_id;
 elsif current_status='voting_open' then
   delete from public.competition_finalists where competition_id=p_competition_id;
   insert into public.competition_finalists(competition_id,idea_id,rank,frozen_score,discussion_count)
   select p_competition_id,i.id,row_number() over(order by coalesce(sum(v.value),0) desc,
     (select count(*) from public.idea_comments c where c.idea_id=i.id) desc,i.created_at asc)::smallint,
     coalesce(sum(v.value),0)::integer,(select count(*) from public.idea_comments c where c.idea_id=i.id)::integer
   from public.ideas i left join public.idea_votes v on v.idea_id=i.id
   where i.competition_id=p_competition_id and i.status='published'
   group by i.id order by coalesce(sum(v.value),0) desc,(select count(*) from public.idea_comments c where c.idea_id=i.id) desc,i.created_at asc limit 3;
   update public.ideas set status='finalist' where id in(select idea_id from public.competition_finalists where competition_id=p_competition_id);
   update public.competitions set status='finalist_review',rankings_frozen_at=now() where id=p_competition_id;
   insert into public.contribution_events(user_id,event_type,points,source_id)
   select i.author_id,'monthly_finalist',60,f.id from public.competition_finalists f join public.ideas i on i.id=f.idea_id where f.competition_id=p_competition_id on conflict do nothing;
   insert into public.user_achievements(user_id,achievement_id,source_id)
   select i.author_id,a.id,f.id from public.competition_finalists f join public.ideas i on i.id=f.idea_id cross join public.achievements a where f.competition_id=p_competition_id and a.slug='monthly-finalist' on conflict do nothing;
 elsif current_status='winner_selected' then update public.competitions set status='archived' where id=p_competition_id;
 else raise exception 'Competition cannot advance from %',current_status; end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_data) values(auth.uid(),'advance_competition','competition',p_competition_id,jsonb_build_object('from',current_status));
end; $$;

create or replace function public.select_competition_winner(p_competition_id uuid,p_idea_id uuid,p_announcement text,p_reason text) returns void
language plpgsql security definer set search_path=public as $$
declare creator uuid; project_id uuid; project_slug text;
begin
 if not public.is_admin() then raise exception 'Admin required'; end if;
 if not exists(select 1 from public.competition_finalists where competition_id=p_competition_id and idea_id=p_idea_id) then raise exception 'Winner must be an official finalist'; end if;
 if char_length(p_announcement)<20 or char_length(p_reason)<20 then raise exception 'Announcement and reason must each be at least 20 characters'; end if;
 select author_id into creator from public.ideas where id=p_idea_id;
 insert into public.competition_results(competition_id,idea_id,selected_by,announcement,reason) values(p_competition_id,p_idea_id,auth.uid(),p_announcement,p_reason);
 update public.competitions set status='winner_selected' where id=p_competition_id;
 update public.ideas set status=case when id=p_idea_id then 'winner' else status end where competition_id=p_competition_id;
 select lower(regexp_replace(left(title,45),'[^a-zA-Z0-9]+','-','g'))||'-'||left(p_idea_id::text,6) into project_slug from public.ideas where id=p_idea_id;
 insert into public.projects(source_idea_id,title,slug,description,leader_id,technology_stack,status,created_by)
 select id,title,project_slug,short_description,author_id,technology_stack,'Recruiting',auth.uid() from public.ideas where id=p_idea_id returning id into project_id;
 insert into public.project_members(project_id,user_id,project_role,is_leader) values(project_id,creator,'Project Leader',true);
 insert into public.contribution_events(user_id,event_type,points,source_id) values(creator,'innovation_champion',150,p_idea_id) on conflict do nothing;
 insert into public.user_achievements(user_id,achievement_id,source_id) select creator,id,p_idea_id from public.achievements where slug='innovation-champion' on conflict do nothing;
 insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url) values(creator,auth.uid(),'competition_winner','Your idea won the arena',p_announcement,'idea',p_idea_id,'/ideas/'||p_idea_id) on conflict do nothing;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_data) values(auth.uid(),'select_winner','competition',p_competition_id,jsonb_build_object('idea_id',p_idea_id,'project_id',project_id));
end; $$;

create or replace function public.admin_set_user_role(p_user_id uuid,p_role text) returns void
language plpgsql security definer set search_path=public as $$
declare old_role text;
begin
 if not public.is_admin() then raise exception 'Admin required'; end if;
 if p_user_id=auth.uid() then raise exception 'Cannot change your own role'; end if;
 if p_role not in ('student','moderator','admin') then raise exception 'Invalid role'; end if;
 select role into old_role from public.profiles where id=p_user_id;
 update public.profiles set role=p_role where id=p_user_id;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data) values(auth.uid(),'set_user_role','profile',p_user_id,jsonb_build_object('role',old_role),jsonb_build_object('role',p_role));
end; $$;

create or replace function public.get_leaderboard(p_period text default 'all')
returns table(user_id uuid,display_name text,username text,avatar_url text,points bigint,project_count bigint)
language sql stable security invoker set search_path=public as $$
 select p.id,p.display_name,p.username::text,p.avatar_url,coalesce(sum(e.points),0)::bigint,
   (select count(*) from public.project_members pm where pm.user_id=p.id and pm.status='active')::bigint
 from public.profiles p left join public.contribution_events e on e.user_id=p.id and
   (p_period='all' or (p_period='week' and e.created_at>=now()-interval '7 days') or (p_period='month' and e.created_at>=date_trunc('month',now())))
 where p.approval_status='approved'
 group by p.id order by coalesce(sum(e.points),0) desc,p.created_at asc limit 100;
$$;

-- Activity-derived points and badges
create or replace function public.record_contribution() returns trigger
language plpgsql security definer set search_path=public as $$
declare owner uuid; event text; pts integer; idea_count integer; source uuid;
begin
 if tg_table_name='ideas' then owner:=new.author_id;event:='published_idea';pts:=15;source:=new.id;
 elsif tg_table_name='idea_comments' then owner:=new.author_id;event:='useful_discussion';pts:=2;source:=new.id;
 elsif tg_table_name='problem_solutions' then owner:=new.author_id;event:='proposed_solution';pts:=8;source:=new.id;
 elsif tg_table_name='project_members' then owner:=new.user_id;event:='project_member';pts:=10;source:=new.project_id;
 else return new; end if;
 insert into public.contribution_events(user_id,event_type,points,source_id) values(owner,event,pts,source) on conflict do nothing;
 update public.profiles set contribution_points=(select coalesce(sum(points),0) from public.contribution_events where user_id=owner),
   current_streak=case when last_contribution_date=current_date-1 then current_streak+1 when last_contribution_date=current_date then current_streak else 1 end,last_contribution_date=current_date where id=owner;
 if tg_table_name='ideas' then
  insert into public.user_achievements(user_id,achievement_id,source_id) select owner,id,new.id from public.achievements where slug='first-idea' on conflict do nothing;
  select count(*) into idea_count from public.ideas where author_id=owner;
  if idea_count>=5 then insert into public.user_achievements(user_id,achievement_id,source_id) select owner,id,new.id from public.achievements where slug='idea-machine' on conflict do nothing; end if;
 elsif tg_table_name='project_members' then
  insert into public.user_achievements(user_id,achievement_id,source_id) select owner,id,new.project_id from public.achievements where slug='project-builder' on conflict do nothing;
 end if;
 return new;
end; $$;
create trigger contribution_idea after insert on public.ideas for each row execute function public.record_contribution();
create trigger contribution_comment after insert on public.idea_comments for each row execute function public.record_contribution();
create trigger contribution_solution after insert on public.problem_solutions for each row execute function public.record_contribution();
create trigger contribution_project after insert on public.project_members for each row execute function public.record_contribution();

create or replace function public.content_notifications() returns trigger
language plpgsql security definer set search_path=public as $$
declare recipient uuid; parent_owner uuid;
begin
 if tg_table_name='idea_comments' then
   select author_id into recipient from public.ideas where id=new.idea_id;
   if new.parent_id is not null then select author_id into parent_owner from public.idea_comments where id=new.parent_id; recipient:=parent_owner; end if;
   if recipient<>new.author_id then insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
    values(recipient,new.author_id,case when new.parent_id is null then 'idea_comment' else 'comment_reply' end,case when new.parent_id is null then 'New comment on your idea' else 'New reply to your comment' end,left(new.body,180),'idea',new.idea_id,'/ideas/'||new.idea_id) on conflict do nothing; end if;
 elsif tg_table_name='problem_solutions' then
   select author_id into recipient from public.problems where id=new.problem_id;
   if recipient<>new.author_id then insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
    values(recipient,new.author_id,'problem_solution','A solution was proposed',new.title,'problem',new.problem_id,'/problems/'||new.problem_id) on conflict do nothing; end if;
 elsif tg_table_name='project_updates' then
   insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
   select pm.user_id,new.author_id,'project_update',new.title,left(new.body,180),'project',new.project_id,'/projects/'||new.project_id from public.project_members pm where pm.project_id=new.project_id and pm.user_id<>new.author_id on conflict do nothing;
 end if; return new;
end; $$;
create trigger notify_comment after insert on public.idea_comments for each row execute function public.content_notifications();
create trigger notify_solution after insert on public.problem_solutions for each row execute function public.content_notifications();
create trigger notify_project_update after insert on public.project_updates for each row execute function public.content_notifications();

-- RLS: deny by default, then grant explicit capabilities.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.competitions enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.vote_activity enable row level security;
alter table public.idea_comments enable row level security;
alter table public.comment_votes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.competition_finalists enable row level security;
alter table public.competition_results enable row level security;
alter table public.problems enable row level security;
alter table public.problem_solutions enable row level security;
alter table public.solution_votes enable row level security;
alter table public.solution_comments enable row level security;
alter table public.problem_volunteers enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_join_requests enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.reports enable row level security;
alter table public.announcements enable row level security;
alter table public.contribution_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_public_read on public.profiles for select using (approval_status='approved' or id=auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());
create policy categories_read on public.categories for select using (true);
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy competitions_read on public.competitions for select using (status<>'draft' or public.is_admin());
create policy competitions_admin_write on public.competitions for all using (public.is_admin()) with check (public.is_admin());
create policy ideas_read on public.ideas for select using (status<>'removed' or author_id=auth.uid() or public.is_staff());
create policy ideas_insert on public.ideas for insert with check (author_id=auth.uid() and public.is_approved());
create policy ideas_owner_update on public.ideas for update using (author_id=auth.uid() or public.is_staff()) with check (author_id=auth.uid() or public.is_staff());
create policy ideas_owner_delete on public.ideas for delete using (author_id=auth.uid() or public.is_admin());
create policy idea_votes_read on public.idea_votes for select using (true);
create policy vote_activity_admin_read on public.vote_activity for select using (public.is_admin());
create policy comments_read on public.idea_comments for select using (true);
create policy comments_insert on public.idea_comments for insert with check (author_id=auth.uid() and public.is_approved());
create policy comments_owner_update on public.idea_comments for update using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy comments_owner_or_staff_delete on public.idea_comments for delete using (author_id=auth.uid() or public.is_staff());
create policy comment_votes_read on public.comment_votes for select using (true);
create policy bookmarks_own on public.bookmarks for all using (user_id=auth.uid()) with check (user_id=auth.uid() and public.is_approved());
create policy finalists_read on public.competition_finalists for select using (true);
create policy finalists_admin_write on public.competition_finalists for all using (public.is_admin()) with check (public.is_admin());
create policy results_read on public.competition_results for select using (true);
create policy results_admin_write on public.competition_results for all using (public.is_admin()) with check (public.is_admin());
create policy problems_read on public.problems for select using (true);
create policy problems_insert on public.problems for insert with check (author_id=auth.uid() and public.is_approved());
create policy problems_update on public.problems for update using (author_id=auth.uid() or public.is_staff()) with check (author_id=auth.uid() or public.is_staff());
create policy problems_delete on public.problems for delete using (author_id=auth.uid() or public.is_admin());
create policy solutions_read on public.problem_solutions for select using (true);
create policy solutions_insert on public.problem_solutions for insert with check (author_id=auth.uid() and public.is_approved());
create policy solutions_update on public.problem_solutions for update using (author_id=auth.uid() or public.is_staff()) with check (author_id=auth.uid() or public.is_staff());
create policy solutions_delete on public.problem_solutions for delete using (author_id=auth.uid() or public.is_staff());
create policy solution_votes_read on public.solution_votes for select using (true);
create policy solution_comments_read on public.solution_comments for select using (true);
create policy solution_comments_insert on public.solution_comments for insert with check (author_id=auth.uid() and public.is_approved());
create policy solution_comments_update on public.solution_comments for update using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy solution_comments_delete on public.solution_comments for delete using (author_id=auth.uid() or public.is_staff());
create policy volunteers_read on public.problem_volunteers for select using (true);
create policy volunteers_own on public.problem_volunteers for all using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() and public.is_approved() or public.is_staff());
create policy projects_read on public.projects for select using (true);
create policy projects_staff_write on public.projects for all using (public.is_admin() or exists(select 1 from public.project_members m where m.project_id=projects.id and m.user_id=auth.uid() and m.is_leader)) with check (public.is_admin() or leader_id=auth.uid());
create policy project_members_read on public.project_members for select using (true);
create policy project_members_manage on public.project_members for all using (public.is_admin() or exists(select 1 from public.project_members lead where lead.project_id=project_members.project_id and lead.user_id=auth.uid() and lead.is_leader)) with check (public.is_admin() or exists(select 1 from public.project_members lead where lead.project_id=project_members.project_id and lead.user_id=auth.uid() and lead.is_leader));
create policy join_requests_insert on public.project_join_requests for insert with check (user_id=auth.uid() and public.is_approved());
create policy join_requests_read on public.project_join_requests for select using (user_id=auth.uid() or public.is_admin() or exists(select 1 from public.project_members m where m.project_id=project_join_requests.project_id and m.user_id=auth.uid() and m.is_leader));
create policy join_requests_manage on public.project_join_requests for update using (user_id=auth.uid() or public.is_admin() or exists(select 1 from public.project_members m where m.project_id=project_join_requests.project_id and m.user_id=auth.uid() and m.is_leader));
create policy tasks_member_read on public.project_tasks for select using (exists(select 1 from public.project_members m where m.project_id=project_tasks.project_id and m.user_id=auth.uid()) or public.is_admin());
create policy tasks_member_write on public.project_tasks for all using (exists(select 1 from public.project_members m where m.project_id=project_tasks.project_id and m.user_id=auth.uid() and m.status='active') or public.is_admin()) with check (exists(select 1 from public.project_members m where m.project_id=project_tasks.project_id and m.user_id=auth.uid() and m.status='active') or public.is_admin());
create policy milestones_read on public.project_milestones for select using (true);
create policy milestones_write on public.project_milestones for all using (public.is_admin() or exists(select 1 from public.project_members m where m.project_id=project_milestones.project_id and m.user_id=auth.uid() and m.is_leader)) with check (public.is_admin() or exists(select 1 from public.project_members m where m.project_id=project_milestones.project_id and m.user_id=auth.uid() and m.is_leader));
create policy updates_read on public.project_updates for select using (true);
create policy updates_member_write on public.project_updates for insert with check (author_id=auth.uid() and exists(select 1 from public.project_members m where m.project_id=project_updates.project_id and m.user_id=auth.uid() and m.status='active'));
create policy updates_owner_manage on public.project_updates for update using (author_id=auth.uid() or public.is_admin()) with check (author_id=auth.uid() or public.is_admin());
create policy updates_owner_delete on public.project_updates for delete using (author_id=auth.uid() or public.is_admin());
create policy notifications_own_read on public.notifications for select using (user_id=auth.uid());
create policy notifications_own_update on public.notifications for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy achievements_read on public.achievements for select using (true);
create policy user_achievements_read on public.user_achievements for select using (true);
create policy reports_insert on public.reports for insert with check (reporter_id=auth.uid() and public.is_approved());
create policy reports_staff_read on public.reports for select using (reporter_id=auth.uid() or public.is_staff());
create policy reports_staff_update on public.reports for update using (public.is_staff()) with check (public.is_staff());
create policy announcements_read on public.announcements for select using (published_at is not null and (expires_at is null or expires_at>now()) or public.is_admin());
create policy announcements_admin_write on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy contributions_read on public.contribution_events for select using (true);
create policy audit_admin_read on public.audit_logs for select using (public.is_admin());

-- Seed only platform taxonomy and badge definitions; no fake users/content/statistics.
insert into public.categories(name,slug) values
 ('Artificial Intelligence','artificial-intelligence'),('Agentic AI','agentic-ai'),('Web Development','web-development'),
 ('App Development','app-development'),('Machine Learning','machine-learning'),('Cybersecurity','cybersecurity'),
 ('Robotics','robotics'),('Blockchain','blockchain'),('IoT','iot'),('Cloud Computing','cloud-computing'),
 ('Automation','automation'),('Other','other') on conflict do nothing;
insert into public.achievements(slug,name,description,icon,points) values
 ('first-idea','First Idea','Published a first idea','lightbulb',10),('idea-machine','Idea Machine','Published five ideas','zap',35),
 ('problem-solver','Problem Solver','Had a problem solution accepted','wrench',40),('top-contributor','Top Contributor','Reached a meaningful contribution threshold','star',80),
 ('monthly-finalist','Monthly Finalist','Reached the monthly top three','medal',60),('innovation-champion','Innovation Champion','Won a monthly arena','trophy',150),
 ('project-builder','Project Builder','Joined an official project','blocks',20),('community-mentor','Community Mentor','Consistently helped other builders','users',75)
 on conflict do nothing;

-- Private attachment bucket with signed reads. File size/type are also checked server-side.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('attachments','attachments',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf','text/plain']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy attachment_upload on storage.objects for insert to authenticated with check (bucket_id='attachments' and (storage.foldername(name))[2]=auth.uid()::text);
create policy attachment_read on storage.objects for select using (bucket_id='attachments');
create policy attachment_owner_update on storage.objects for update to authenticated using (bucket_id='attachments' and owner_id=auth.uid());
create policy attachment_owner_delete on storage.objects for delete to authenticated using (bucket_id='attachments' and owner_id=auth.uid());

-- Realtime only where it adds user value.
do $$ begin
 alter publication supabase_realtime add table public.idea_comments;
 alter publication supabase_realtime add table public.notifications;
 alter publication supabase_realtime add table public.project_updates;
exception when duplicate_object then null; end $$;

grant execute on function public.cast_idea_vote(uuid,smallint) to authenticated;
grant execute on function public.cast_comment_vote(uuid) to authenticated;
grant execute on function public.cast_solution_vote(uuid,smallint) to authenticated;
grant execute on function public.accept_problem_solution(uuid,uuid) to authenticated;
grant execute on function public.get_leaderboard(text) to anon,authenticated;
revoke execute on function public.advance_competition(uuid) from public,anon;
revoke execute on function public.select_competition_winner(uuid,uuid,text,text) from public,anon;
revoke execute on function public.admin_set_user_role(uuid,text) from public,anon;
grant execute on function public.advance_competition(uuid) to authenticated;
grant execute on function public.select_competition_winner(uuid,uuid,text,text) to authenticated;
grant execute on function public.admin_set_user_role(uuid,text) to authenticated;
