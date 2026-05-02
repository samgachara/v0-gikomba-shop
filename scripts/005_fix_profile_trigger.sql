-- CRITICAL FIX: Profile trigger was not setting role from signup metadata
-- This caused all new signups to have role=NULL, breaking all dashboards

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'buyer');
  IF v_role NOT IN ('buyer', 'seller', 'admin') THEN v_role := 'buyer'; END IF;
  IF v_role = 'admin' THEN v_role := 'buyer'; END IF;

  INSERT INTO public.profiles (id, first_name, last_name, phone, role, is_active)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    v_role, true
  )
  ON CONFLICT (id) DO UPDATE SET
    role       = EXCLUDED.role,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name  = COALESCE(EXCLUDED.last_name,  profiles.last_name),
    phone      = COALESCE(EXCLUDED.phone,      profiles.phone),
    is_active  = true;

  IF v_role = 'seller' THEN
    INSERT INTO public.sellers (id, store_name, status, verified)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'first_name', 'Seller') || '''s Shop', 'active', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
