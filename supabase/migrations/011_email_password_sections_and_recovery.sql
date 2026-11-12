-- Email/password registration without email delivery, student sections, and
-- administrator-assisted password recovery. Existing users and ownership IDs
-- remain unchanged.

alter table public.profiles
  add column if not exists section text;

alter table public.profiles
  drop constraint if exists profiles_section_check;

alter table public.profiles
  add constraint profiles_section_check
  check (section is null or section in ('Section 1','Section 2','Section 3','Section 4','Section 5'));

create table if not exists public.account_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','rejected')),
  requested_at timestamptz not null default now(),
  handled_at timestamptz,
  handled_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists account_recovery_one_pending_idx
  on public.account_recovery_requests(user_id)
  where status='pending';
create index if not exists account_recovery_status_time_idx
  on public.account_recovery_requests(status,requested_at desc);

alter table public.account_recovery_requests enable row level security;

drop policy if exists account_recovery_admin_read on public.account_recovery_requests;
create policy account_recovery_admin_read
  on public.account_recovery_requests for select
  using (public.is_admin());

-- Public callers receive no account-existence signal. A pending request is
-- created only for a real email identity, with a per-account cooldown.
create or replace function public.request_account_recovery(p_email text)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  target_user uuid;
begin
  if p_email is null or char_length(trim(p_email)) > 320 then return; end if;

  select u.id into target_user
  from auth.users u
  where lower(u.email)=lower(trim(p_email))
  limit 1;

  if target_user is null then return; end if;

  if exists (
    select 1 from public.account_recovery_requests r
    where r.user_id=target_user
      and r.requested_at > now()-interval '15 minutes'
  ) then return; end if;

  if not exists (
    select 1 from public.account_recovery_requests r
    where r.user_id=target_user and r.status='pending'
  ) then
    insert into public.account_recovery_requests(user_id) values(target_user);
  end if;
end;
$$;

revoke all on function public.request_account_recovery(text) from public;
grant execute on function public.request_account_recovery(text) to anon,authenticated;

-- Populate profiles for both password and OAuth identities. Password signups
-- must include a valid section; OAuth profiles remain compatible with a null
-- section. Usernames stay unique but are generated from the email local part.
create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  base_username text;
  final_username text;
  safe_display_name text;
  safe_avatar_url text;
  safe_section text;
  email_domain text;
  domain_allowed boolean;
  identity_provider text;
begin
  base_username := lower(regexp_replace(
    split_part(coalesce(new.email,''),'@',1),
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

  safe_display_name := trim(coalesce(
    nullif(new.raw_user_meta_data->>'display_name',''),
    nullif(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'name',''),
    ''
  ));
  if char_length(safe_display_name) < 2 then safe_display_name := 'NIAT Builder'; end if;
  safe_display_name := left(safe_display_name,60);

  safe_avatar_url := nullif(trim(coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    ''
  )), '');
  if safe_avatar_url is not null and safe_avatar_url !~ '^https://' then safe_avatar_url := null; end if;

  safe_section := nullif(trim(coalesce(new.raw_user_meta_data->>'section','')), '');
  if safe_section is not null and safe_section not in ('Section 1','Section 2','Section 3','Section 4','Section 5') then
    raise exception 'Invalid student section';
  end if;

  identity_provider := coalesce(new.raw_app_meta_data->>'provider','email');
  if identity_provider='email' and safe_section is null then
    raise exception 'Student section is required';
  end if;

  email_domain := lower(split_part(coalesce(new.email,''),'@',2));
  select exists(
    select 1 from public.allowed_registration_domains d
    where d.domain=email_domain and d.active
  ) into domain_allowed;

  insert into public.profiles(id,display_name,username,avatar_url,section,approval_status)
  values(new.id,safe_display_name,final_username,safe_avatar_url,safe_section,
    case when domain_allowed then 'approved' else 'pending' end);
  return new;
end;
$$;
