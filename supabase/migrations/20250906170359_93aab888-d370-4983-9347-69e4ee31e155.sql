-- Remove multiple roles support and enforce single role per user
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_single_role UNIQUE (user_id);

-- Remove is_primary column as it's no longer needed
ALTER TABLE public.user_roles 
DROP COLUMN IF EXISTS is_primary;

-- Update RLS policies to be simpler for single role
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Create simplified RLS policies for single role system
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" 
ON public.user_roles 
FOR UPDATE 
USING (auth.uid() = user_id);