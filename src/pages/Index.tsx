import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters } from "@/components/SearchFilters";
import { DoctorCard } from "@/components/DoctorCard";
import { AppointmentBooking } from "@/components/AppointmentBooking";
import { PatientTracking } from "@/components/PatientTracking";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Heart, Shield, Clock, Users, Star, Activity, CalendarCheck, Stethoscope, LogOut } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

const mockDoctors = [
  {
    id: "1",
    name: "Sarah Wilson",
    specialization: "Cardiologist",
    fees: 800,
    rating: 4.8,
    location: "Mumbai Central",
    image: doctor1,
    availableSlots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"],
    experience: 12,
  },
  {
    id: "2", 
    name: "Michael Chen",
    specialization: "General Physician",
    fees: 500,
    rating: 4.9,
    location: "Bandra West",
    image: doctor2,
    availableSlots: ["9:00 AM", "10:30 AM", "3:00 PM"],
    experience: 8,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    specialization: "Pediatrician", 
    fees: 600,
    rating: 4.7,
    location: "Andheri East",
    image: doctor3,
    availableSlots: ["11:00 AM", "1:00 PM", "5:00 PM"],
    experience: 15,
  },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading, needsRoleSelection, setUserRole } = useUserRole();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);

  const handleSpecializationFilter = (specialization: string) => {
    if (specialization === "All Specialists") {
      setFilteredDoctors(mockDoctors);
    } else {
      setFilteredDoctors(mockDoctors.filter(doc => doc.specialization === specialization));
    }
  };

  const handleLocationFilter = (location: string) => {
    // In real app, filter by location
    console.log("Filter by location:", location);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredDoctors(mockDoctors);
      return;
    }
    setFilteredDoctors(
      mockDoctors.filter(doc =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleBookAppointment = (doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    setSelectedDoctor(doctor);
  };

  const handleBookingComplete = (appointmentId: string) => {
    const appointment = {
      id: appointmentId,
      doctorName: selectedDoctor?.name || "",
      doctorSpecialization: selectedDoctor?.specialization || "",
      appointmentTime: "10:30 AM",
      appointmentDate: new Date().toISOString().split('T')[0],
      status: "booked" as const,
      queuePosition: 2,
      estimatedWaitTime: 15,
    };
    setCurrentAppointment(appointment);
    setSelectedDoctor(null);
  };

  const handleStatusUpdate = (appointmentId: string, status: string) => {
    if (currentAppointment) {
      setCurrentAppointment({ ...currentAppointment, status });
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">AppointLive</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email} ({role})
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Role-based Content */}
      {role === "patient" ? (
        <PatientDashboard />
      ) : role === "doctor" ? (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage your appointments and track patient arrivals in real-time</p>
          </div>
          
          <DoctorDashboard />
        </div>
      ) : needsRoleSelection ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to AppointLive</h1>
              <p className="text-muted-foreground">Please select your role to continue</p>
            </div>
            
            <div className="grid gap-4">
              <Button
                onClick={() => setUserRole("patient")}
                className="h-16 text-left justify-start gap-4"
                variant="outline"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">I'm a Patient</div>
                  <div className="text-sm text-muted-foreground">Book appointments and track health</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setUserRole("doctor")}
                className="h-16 text-left justify-start gap-4"
                variant="outline"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold">I'm a Doctor</div>
                  <div className="text-sm text-muted-foreground">Manage appointments and patients</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Welcome to AppointLive</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <AppointmentBooking
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
};

export default Index;
