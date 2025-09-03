import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<("patient" | "doctor")[]>([]);
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setSelectedRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role, is_primary")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
          setSelectedRole(null);
        } else {
          const userRoles = data.map(r => r.role as "patient" | "doctor");
          setRoles(userRoles);
          
          // Set selected role from sessionStorage or use primary role
          const savedRole = sessionStorage.getItem(`selectedRole_${user.id}`);
          if (savedRole && userRoles.includes(savedRole as "patient" | "doctor")) {
            setSelectedRole(savedRole as "patient" | "doctor");
          } else {
            // Use primary role or first available role
            const primaryRole = data.find(r => r.is_primary)?.role;
            setSelectedRole((primaryRole || userRoles[0]) as "patient" | "doctor");
          }
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
        setSelectedRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const switchRole = (role: "patient" | "doctor") => {
    if (roles.includes(role)) {
      setSelectedRole(role);
      if (user) {
        sessionStorage.setItem(`selectedRole_${user.id}`, role);
      }
    }
  };

  return { 
    roles, 
    role: selectedRole, 
    loading, 
    switchRole,
    hasMultipleRoles: roles.length > 1 
  };
};