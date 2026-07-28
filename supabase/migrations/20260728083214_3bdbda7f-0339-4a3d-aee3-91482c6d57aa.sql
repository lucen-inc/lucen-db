
CREATE OR REPLACE FUNCTION public.normalize_org_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(regexp_replace(coalesce(_name, ''), '[^a-zA-Z0-9]+', '', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.set_organizations_normalized_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.normalized_name := public.normalize_org_name(NEW.name);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_org_name(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_organizations_normalized_name() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
