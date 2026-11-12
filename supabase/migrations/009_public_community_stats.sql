-- Public aggregate counters without exposing pending profiles or auth records.
-- Student totals include email-confirmed registrations that are pending or approved.

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
      from public.profiles p
      join auth.users u on u.id = p.id
      where u.email_confirmed_at is not null
        and p.approval_status in ('pending','approved')
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

revoke all on function public.get_community_stats() from public;
grant execute on function public.get_community_stats() to anon, authenticated;
