-- Drop the conflicting policy that might be preventing patient self-access
DROP POLICY IF EXISTS "Doctors can view patient info for their appointments" ON public.patients;

-- Recreate a more permissive policy that allows both self-access and doctor access
CREATE POLICY "Patients can view own profile and doctors can view for appointments"
ON public.patients
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.patient_id = patients.id AND d.user_id = auth.uid()
  )
);