-- Public aggregate counters without exposing private profile or auth records.
-- Student totals include registered profiles that are pending or approved.

create or replace function public.get_community_stats()
returns table(
  students bigint,
  ideas bigint,
  problems bigint,
  projects bigint,
  contributors bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.profiles
      where approval_status in ('pending','approved')
    )::bigint as students,
    (select count(*) from public.ideas where status <> 'removed')::bigint as ideas,
    (select count(*) from public.problems)::bigint as problems,
    (select count(*) from public.projects where status <> 'Archived')::bigint as projects,
    (
      select count(*)
      from public.profiles
      where contribution_points > 0
        and approval_status = 'approved'
    )::bigint as contributors;
$$;

comment on function public.get_community_stats() is
'Public database-derived counters. Students are registered profiles pending or approved; content counters exclude removed or archived records.';

revoke all on function public.get_community_stats() from public;
grant execute on function public.get_community_stats() to anon, authenticated;
