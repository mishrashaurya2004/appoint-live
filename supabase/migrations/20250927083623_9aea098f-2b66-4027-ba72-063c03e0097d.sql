-- Update appointment status constraint to include all valid statuses
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('booked', 'on-way', 'arrived', 'in-progress', 'completed', 'no-show', 'late', 'cancelled'));

-- Add symptoms and reason columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS symptoms TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT;