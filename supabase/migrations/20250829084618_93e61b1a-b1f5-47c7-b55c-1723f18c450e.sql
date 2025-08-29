-- Change all table IDs from UUID to INTEGER with auto-increment

-- First, drop foreign key constraints and recreate tables with INTEGER IDs

-- Drop existing tables in correct order (respecting dependencies)
DROP TABLE IF EXISTS public.realtime_tracking;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.patient_profiles;
DROP TABLE IF EXISTS public.doctor_profiles;
DROP TABLE IF EXISTS public.patients;
DROP TABLE IF EXISTS public.doctors;

-- Recreate patients table with INTEGER ID
CREATE TABLE public.patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate doctors table with INTEGER ID
CREATE TABLE public.doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  fees NUMERIC NOT NULL,
  schedule JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate patient_profiles table with user_id as TEXT (to reference auth.users.id)
CREATE TABLE public.patient_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- This references auth.users.id which is UUID as text
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate doctor_profiles table with user_id as TEXT (to reference auth.users.id)
CREATE TABLE public.doctor_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- This references auth.users.id which is UUID as text
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  fees NUMERIC NOT NULL,
  schedule JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate appointments table with INTEGER foreign keys
CREATE TABLE public.appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate realtime_tracking table with INTEGER foreign key
CREATE TABLE public.realtime_tracking (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  patient_location_lat NUMERIC,
  patient_location_lng NUMERIC,
  eta_minutes INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_tracking ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for patient_profiles
CREATE POLICY "Patients can view their own profile" 
ON public.patient_profiles 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Patients can update their own profile" 
ON public.patient_profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own patient profile during signup" 
ON public.patient_profiles 
FOR INSERT 
WITH CHECK (true);

-- Recreate RLS policies for doctor_profiles
CREATE POLICY "Doctors can view their own profile" 
ON public.doctor_profiles 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Patients can view doctor profiles" 
ON public.doctor_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Doctors can update their own profile" 
ON public.doctor_profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own doctor profile during signup" 
ON public.doctor_profiles 
FOR INSERT 
WITH CHECK (true);

-- Recreate RLS policies for appointments
CREATE POLICY "Anyone can view appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

-- Recreate RLS policies for realtime_tracking
CREATE POLICY "Anyone can view tracking" 
ON public.realtime_tracking 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tracking" 
ON public.realtime_tracking 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tracking" 
ON public.realtime_tracking 
FOR UPDATE 
USING (true);

-- Recreate RLS policies for doctors table
CREATE POLICY "Doctors are viewable by everyone" 
ON public.doctors 
FOR SELECT 
USING (true);

-- Recreate RLS policies for patients table  
CREATE POLICY "Patients can view their own profile" 
ON public.patients 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Patients can update their own profile" 
ON public.patients 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can create patient profile" 
ON public.patients 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();