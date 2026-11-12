-- Populate safe profile fields for email/password and Google OAuth identities.
-- Registration approval remains database-authoritative.

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

  email_domain := lower(split_part(coalesce(new.email,''),'@',2));
  select exists(
    select 1 from public.allowed_registration_domains d
    where d.domain=email_domain and d.active
  ) into domain_allowed;

  insert into public.profiles(id,display_name,username,avatar_url,approval_status)
  values(new.id,safe_display_name,final_username,safe_avatar_url,case when domain_allowed then 'approved' else 'pending' end);
  return new;
end;
$$;
