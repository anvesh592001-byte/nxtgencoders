-- Chief role: protected super-admin tier for titanxgod10 and emmanuelgotru.
-- Chiefs inherit all admin permissions via is_admin()/is_staff(), but their
-- role can never be changed away from 'chief' by anyone through any path.

-- 1. Allow 'chief' as a valid role.
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student','moderator','admin','chief'));

-- 2. Chiefs have admin-level permissions.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(public.current_role() IN ('admin','chief'), false);
$$;

-- 3. Chiefs have staff-level permissions.
CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(public.current_role() IN ('moderator','admin','chief'), false);
$$;

-- 4. Database-level protection: a chief's role can never be changed away from
--    'chief', regardless of who attempts it or via which path (RPC, direct
--    update, admin tooling). This is the authoritative guard.
CREATE OR REPLACE FUNCTION public.protect_chief_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF OLD.role = 'chief' AND NEW.role IS DISTINCT FROM 'chief' THEN
    RAISE EXCEPTION 'Chief role is protected and cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_chief_role_trigger ON public.profiles;
CREATE TRIGGER protect_chief_role_trigger
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_chief_role();

-- 5. Harden the role-change RPC: it can never target a chief account and can
--    never promote anyone to chief. Defense in depth alongside the trigger.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_role text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin required'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'Cannot change your own role'; END IF;
  IF p_role NOT IN ('student','moderator','admin') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  SELECT role INTO old_role FROM public.profiles WHERE id = p_user_id;
  IF old_role = 'chief' THEN RAISE EXCEPTION 'Chief role is protected and cannot be changed'; END IF;
  UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
  INSERT INTO public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data)
    VALUES(auth.uid(),'set_user_role','profile',p_user_id,jsonb_build_object('role',old_role),jsonb_build_object('role',p_role));
END;
$$;

-- 6. Assign the protected Chief role to the two specified accounts.
UPDATE public.profiles SET role = 'chief'
  WHERE username IN ('titanxgod10', 'emmanuelgotru');
