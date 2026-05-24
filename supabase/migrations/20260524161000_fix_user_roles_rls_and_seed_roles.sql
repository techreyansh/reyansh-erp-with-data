-- Fix user_roles RLS recursion and seed baseline roles for ERP login.

INSERT INTO public.roles (name, code)
VALUES
  ('CEO', 'CEO'),
  ('Customer Relations Manager', 'CUSTOMER_RELATIONS_MANAGER'),
  ('Sales Executive', 'SALES_EXECUTIVE'),
  ('Store Manager', 'STORE_MANAGER'),
  ('Production Manager', 'PRODUCTION_MANAGER'),
  ('Purchase Executive', 'PURCHASE_EXECUTIVE'),
  ('HR Manager', 'HR_MANAGER'),
  ('Accounts Executive', 'ACCOUNTS_EXECUTIVE'),
  ('Employee', 'EMPLOYEE')
ON CONFLICT (code) DO NOTHING;

UPDATE public.users u
SET role_id = r.id
FROM public.roles r
WHERE r.code = 'CEO'
  AND (
    u.role_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM public.roles existing WHERE existing.id = u.role_id)
  );

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_super_admin_all" ON public.user_roles;
CREATE POLICY "user_roles_super_admin_all"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.allowed_admins a
      WHERE a.email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.allowed_admins a
      WHERE a.email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
  );

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_anon_no_rows" ON public.user_roles;
CREATE POLICY "user_roles_anon_no_rows"
  ON public.user_roles
  FOR SELECT
  TO anon
  USING (false);
