-- Eliminate recursive project_members RLS evaluation and tighten project authorization.

create or replace function public.is_active_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(exists(
    select 1 from public.project_members m
    where m.project_id=p_project_id
      and m.user_id=auth.uid()
      and m.status='active'
  ),false);
$$;

create or replace function public.is_project_leader(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(exists(
    select 1 from public.project_members m
    where m.project_id=p_project_id
      and m.user_id=auth.uid()
      and m.status='active'
      and m.is_leader
  ),false);
$$;

create or replace function public.can_manage_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select public.is_admin() or public.is_project_leader(p_project_id);
$$;

revoke all on function public.is_active_project_member(uuid) from public;
revoke all on function public.is_project_leader(uuid) from public;
revoke all on function public.can_manage_project(uuid) from public;
grant execute on function public.is_active_project_member(uuid) to anon, authenticated;
grant execute on function public.is_project_leader(uuid) to anon, authenticated;
grant execute on function public.can_manage_project(uuid) to anon, authenticated;

-- The original FOR ALL policies also applied while reading and caused recursion.
drop policy if exists projects_staff_write on public.projects;
drop policy if exists project_members_manage on public.project_members;
drop policy if exists join_requests_manage on public.project_join_requests;
drop policy if exists tasks_member_read on public.project_tasks;
drop policy if exists tasks_member_write on public.project_tasks;
drop policy if exists milestones_write on public.project_milestones;
drop policy if exists updates_member_write on public.project_updates;

create policy projects_admin_insert on public.projects for insert
with check (public.is_admin());
create policy projects_manager_update on public.projects for update
using (public.can_manage_project(id))
with check (public.can_manage_project(id));
create policy projects_admin_delete on public.projects for delete
using (public.is_admin());

create policy project_members_manager_insert on public.project_members for insert
with check (public.can_manage_project(project_id));
create policy project_members_manager_update on public.project_members for update
using (public.can_manage_project(project_id))
with check (public.can_manage_project(project_id));
create policy project_members_manager_delete on public.project_members for delete
using (public.can_manage_project(project_id));

-- Applicants may read and withdraw their request, but only leaders/admins may decide it.
create policy join_requests_manager_update on public.project_join_requests for update
using (public.can_manage_project(project_id))
with check (public.can_manage_project(project_id));
create policy join_requests_owner_or_manager_delete on public.project_join_requests for delete
using (user_id=auth.uid() or public.can_manage_project(project_id));

create policy tasks_member_read on public.project_tasks for select
using (public.is_active_project_member(project_id) or public.is_admin());
create policy tasks_member_insert on public.project_tasks for insert
with check (public.is_active_project_member(project_id) or public.is_admin());
create policy tasks_member_update on public.project_tasks for update
using (public.is_active_project_member(project_id) or public.is_admin())
with check (public.is_active_project_member(project_id) or public.is_admin());
create policy tasks_member_delete on public.project_tasks for delete
using (public.is_active_project_member(project_id) or public.is_admin());

create policy milestones_manager_insert on public.project_milestones for insert
with check (public.can_manage_project(project_id));
create policy milestones_manager_update on public.project_milestones for update
using (public.can_manage_project(project_id))
with check (public.can_manage_project(project_id));
create policy milestones_manager_delete on public.project_milestones for delete
using (public.can_manage_project(project_id));

create policy updates_member_insert on public.project_updates for insert
with check (author_id=auth.uid() and public.is_active_project_member(project_id));

-- Recreate the project-assets insert policy with the non-recursive membership predicate.
drop policy if exists nxt_project_assets_member_insert on storage.objects;
create policy nxt_project_assets_member_insert on storage.objects for insert to authenticated
with check (
  bucket_id='project-assets'
  and (storage.foldername(name))[2]=auth.uid()::text
  and (
    public.is_admin()
    or public.is_active_project_member(((storage.foldername(name))[1])::uuid)
  )
);
