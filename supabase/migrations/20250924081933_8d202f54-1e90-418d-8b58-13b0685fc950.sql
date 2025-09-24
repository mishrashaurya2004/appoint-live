-- Remove the recursive policy
DROP POLICY IF EXISTS "Patients can view own profile and doctors can view for appointments" ON public.patients;

-- Create a SECURITY DEFINER helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.doctor_can_view_patient(_patient_id int)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.patient_id = _patient_id
      AND d.user_id = auth.uid()
  );
$$;

-- Policy for doctors to view patient info for their own appointments using the helper
CREATE POLICY "Doctors can view patient info for own appointments"
ON public.patients
FOR SELECT
USING (public.doctor_can_view_patient(id));