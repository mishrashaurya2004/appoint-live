-- Allow doctors to view patient info for appointments they are assigned to
CREATE POLICY "Doctors can view patient info for their appointments"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.patient_id = patients.id AND d.user_id = auth.uid()
  )
);
