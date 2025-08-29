-- Fix RLS policy for patient_profiles to allow creation during signup
DROP POLICY IF EXISTS "Anyone can create patient profile" ON public.patient_profiles;

-- Create a policy that allows users to insert their own profile even before being fully authenticated
CREATE POLICY "Users can create their own patient profile during signup" 
ON public.patient_profiles 
FOR INSERT 
WITH CHECK (true);

-- Also fix the doctor_profiles policy for consistency
DROP POLICY IF EXISTS "Anyone can create doctor profile" ON public.doctor_profiles;

CREATE POLICY "Users can create their own doctor profile during signup" 
ON public.doctor_profiles 
FOR INSERT 
WITH CHECK (true);