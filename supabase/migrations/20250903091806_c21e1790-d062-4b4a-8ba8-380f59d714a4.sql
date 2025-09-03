-- Modify user_roles to allow multiple roles per user
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

-- Add a primary_role column to track the default role
ALTER TABLE public.user_roles ADD COLUMN is_primary BOOLEAN DEFAULT false;

-- Update RLS policies to handle multiple roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert multiple roles
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;
CREATE POLICY "Users can insert their own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their role preferences
CREATE POLICY "Users can update their own roles" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);