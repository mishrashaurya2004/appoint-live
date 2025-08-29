import { useState } from "react";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "../components/DoctorDashboard";

const Index = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<UserRole>(null);

  // Use currentView if set, otherwise fall back to user's role
  const activeView = currentView || role;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSwitchToDoctor = () => {
    setCurrentView("doctor");
  };

  const handleSwitchToPatient = () => {
    setCurrentView("patient");
  };

  if (activeView === "doctor") {
    return <DoctorDashboard onSwitchToPatient={handleSwitchToPatient} />;
  }

  // Default to patient view
  return <PatientDashboard onSwitchToDoctor={handleSwitchToDoctor} />;
};

export default Index;
