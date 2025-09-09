-- Check if trigger exists and create it if not
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically assign roles on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- For existing users without roles, we need a way to handle them
-- Let's check if the current user has a role, and if not, we'll need to handle this in the application