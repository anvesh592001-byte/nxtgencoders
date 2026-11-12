-- Database-authoritative registration approval and query-ordering indexes.
-- Never trust client-provided metadata to approve an account.

create table if not exists public.allowed_registration_domains (
  domain citext primary key check (domain ~ '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.allowed_registration_domains enable row level security;

drop policy if exists allowed_domains_staff_read on public.allowed_registration_domains;
drop policy if exists allowed_domains_admin_insert on public.allowed_registration_domains;
drop policy if exists allowed_domains_admin_update on public.allowed_registration_domains;
drop policy if exists allowed_domains_admin_delete on public.allowed_registration_domains;
create policy allowed_domains_staff_read on public.allowed_registration_domains for select
using (public.is_staff());
create policy allowed_domains_admin_insert on public.allowed_registration_domains for insert
with check (public.is_admin() and created_by=auth.uid());
create policy allowed_domains_admin_update on public.allowed_registration_domains for update
using (public.is_admin()) with check (public.is_admin());
create policy allowed_domains_admin_delete on public.allowed_registration_domains for delete
using (public.is_admin());

drop trigger if exists allowed_registration_domains_updated on public.allowed_registration_domains;
create trigger allowed_registration_domains_updated before update on public.allowed_registration_domains
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  base_username text;
  final_username text;
  safe_display_name text;
  email_domain text;
  domain_allowed boolean;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email,''),'@',1), ''),
    '[^a-zA-Z0-9_]', '', 'g'
  ));
  base_username := left(base_username,24);
  if char_length(base_username) < 3 then
    base_username := 'builder_' || left(replace(new.id::text,'-',''),8);
  end if;

  final_username := base_username;
  if exists (select 1 from public.profiles p where p.username=final_username) then
    final_username := left(base_username,15) || '_' || left(replace(new.id::text,'-',''),8);
  end if;

  safe_display_name := trim(coalesce(new.raw_user_meta_data->>'display_name',''));
  if char_length(safe_display_name) < 2 then safe_display_name := 'NIAT Builder'; end if;
  safe_display_name := left(safe_display_name,60);

  email_domain := lower(split_part(coalesce(new.email,''),'@',2));
  select exists(
    select 1 from public.allowed_registration_domains d
    where d.domain=email_domain and d.active
  ) into domain_allowed;

  insert into public.profiles(id,display_name,username,approval_status)
  values(new.id,safe_display_name,final_username,case when domain_allowed then 'approved' else 'pending' end);
  return new;
end;
$$;

-- Stable order and selective lookup indexes used by application feeds and workspaces.
create index if not exists profiles_approval_created_idx on public.profiles(approval_status,created_at desc);
create index if not exists competitions_status_dates_idx on public.competitions(status,submission_deadline,voting_deadline);
create index if not exists bookmarks_user_created_idx on public.bookmarks(user_id,created_at desc);
create index if not exists volunteers_user_created_idx on public.problem_volunteers(user_id,created_at desc);
create index if not exists projects_status_created_idx on public.projects(status,created_at desc);
create index if not exists project_members_project_status_idx on public.project_members(project_id,status);
create index if not exists join_requests_project_status_idx on public.project_join_requests(project_id,status,created_at desc);
create index if not exists project_milestones_due_idx on public.project_milestones(project_id,due_date);
create index if not exists project_updates_project_created_idx on public.project_updates(project_id,created_at desc);
create index if not exists user_achievements_user_awarded_idx on public.user_achievements(user_id,awarded_at desc);
create index if not exists announcements_published_idx on public.announcements(published_at desc,expires_at);
