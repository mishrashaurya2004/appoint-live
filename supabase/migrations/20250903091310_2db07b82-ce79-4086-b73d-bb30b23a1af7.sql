-- Drop existing tables and recreate with proper integer IDs and user mapping
DROP TABLE IF EXISTS realtime_tracking CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
DROP TABLE IF EXISTS doctor_profiles CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

-- Create user roles table for mapping auth.users to local integer IDs
CREATE TABLE public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table with integer IDs
CREATE TABLE public.patients (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table with integer IDs
CREATE TABLE public.doctors (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT NOT NULL,
  fees NUMERIC NOT NULL,
  location TEXT NOT NULL,
  schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table linking integer IDs
CREATE TABLE public.appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create realtime tracking table
CREATE TABLE public.realtime_tracking (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_location_lat NUMERIC,
  patient_location_lng NUMERIC,
  eta_minutes INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role during signup" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for patients
CREATE POLICY "Patients can view their own profile" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own profile" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patient profile" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for doctors
CREATE POLICY "Patients can view doctor profiles" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can view their own profile" ON public.doctors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own doctor profile" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
  );

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid())
  );

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
  );

-- RLS Policies for realtime_tracking
CREATE POLICY "Users can view tracking for their appointments" ON public.realtime_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = realtime_tracking.appointment_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = realtime_tracking.appointment_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tracking for their appointments" ON public.realtime_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = realtime_tracking.appointment_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = realtime_tracking.appointment_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tracking for their appointments" ON public.realtime_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = realtime_tracking.appointment_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = realtime_tracking.appointment_id AND d.user_id = auth.uid()
    )
  );

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();