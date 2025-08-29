-- Create profiles table for patients
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for doctors  
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  fees NUMERIC NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Patient policies
CREATE POLICY "Patients can view their own profile" 
ON public.patient_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Patients can update their own profile" 
ON public.patient_profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Anyone can create patient profile" 
ON public.patient_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Doctor policies
CREATE POLICY "Doctors can view their own profile" 
ON public.doctor_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" 
ON public.doctor_profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Anyone can create doctor profile" 
ON public.doctor_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow patients to view doctor profiles
CREATE POLICY "Patients can view doctor profiles" 
ON public.doctor_profiles 
FOR SELECT 
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
BEFORE UPDATE ON public.doctor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();