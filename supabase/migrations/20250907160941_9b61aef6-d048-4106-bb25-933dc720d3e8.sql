-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Extract role from user metadata
  DECLARE
    user_role TEXT;
    user_name TEXT;
    user_phone TEXT;
    user_email TEXT;
    user_specialization TEXT;
    user_fees NUMERIC;
    user_location TEXT;
  BEGIN
    -- Get user metadata
    user_role := NEW.raw_user_meta_data ->> 'role';
    user_name := NEW.raw_user_meta_data ->> 'name';
    user_phone := NEW.raw_user_meta_data ->> 'phone';
    user_email := NEW.email;
    user_specialization := NEW.raw_user_meta_data ->> 'specialization';
    user_fees := (NEW.raw_user_meta_data ->> 'fees')::NUMERIC;
    user_location := NEW.raw_user_meta_data ->> 'location';

    -- Insert user role
    IF user_role IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, user_role);
    END IF;

    -- Insert into appropriate profile table based on role
    IF user_role = 'patient' THEN
      INSERT INTO public.patients (user_id, name, email, phone)
      VALUES (NEW.id, user_name, user_email, user_phone);
    ELSIF user_role = 'doctor' THEN
      INSERT INTO public.doctors (user_id, name, email, phone, specialization, fees, location)
      VALUES (NEW.id, user_name, user_email, user_phone, user_specialization, user_fees, user_location);
    END IF;

    RETURN NEW;
  END;
END;
$$;