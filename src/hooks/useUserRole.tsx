import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "patient" | "doctor" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is a patient
        const { data: patientData, error: patientError } = await supabase
          .from("patient_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (patientData && !patientError) {
          setRole("patient");
          setLoading(false);
          return;
        }

        // Check if user is a doctor
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctor_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (doctorData && !doctorError) {
          setRole("doctor");
          setLoading(false);
          return;
        }

        // If neither patient nor doctor profile exists
        setRole(null);
        setLoading(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setRole(null);
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return { role, loading };
};