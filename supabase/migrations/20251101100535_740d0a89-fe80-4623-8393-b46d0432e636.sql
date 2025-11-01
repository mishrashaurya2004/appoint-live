-- First, delete duplicate appointments keeping the earliest one
DELETE FROM public.appointments a1
USING public.appointments a2
WHERE a1.id > a2.id 
  AND a1.doctor_id = a2.doctor_id 
  AND a1.slot_time = a2.slot_time;

-- Now add the unique constraint to prevent future double bookings
ALTER TABLE public.appointments 
ADD CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, slot_time);