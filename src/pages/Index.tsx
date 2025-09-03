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
  const { role, loading: roleLoading } = useUserRole();
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
            
            <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Role-based Content */}
      {role === "patient" ? (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-hero text-white py-20">
            <div className="absolute inset-0 opacity-20">
              <img
                src={heroImage}
                alt="Medical hero"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Book Doctor Appointments
                <span className="block text-white/90">with Real-time Tracking</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Find trusted doctors, book appointments instantly, and track your visit in real-time.
                No more waiting in queues!
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5" />
                  <span>Verified Doctors</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Heart className="w-5 h-5" />
                  <span>24/7 Support</span>
                </div>
              </div>

              <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
                Find Doctors Near You
              </Button>
            </div>
          </section>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {currentAppointment ? (
              <div className="max-w-2xl mx-auto">
                <PatientTracking
                  appointment={currentAppointment}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="bg-gradient-card border-0 shadow-medium sticky top-4">
                    <CardContent className="p-6">
                      <SearchFilters
                        onSpecializationFilter={handleSpecializationFilter}
                        onLocationFilter={handleLocationFilter}
                        onSearch={handleSearch}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Doctors List */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Available Doctors</h2>
                    <Badge variant="outline" className="text-medical-blue border-medical-blue">
                      {filteredDoctors.length} doctors found
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onBookAppointment={handleBookAppointment}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Features Section */}
          <section className="bg-muted py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose AppointLive?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Experience the future of healthcare appointments with our innovative features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-medical-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-medical-blue" />
                  </div>
                  <h3 className="font-semibold mb-2">Real-time Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your appointment status and get live updates from your doctor
                  </p>
                </Card>

                <Card className="text-center p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-medical-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CalendarCheck className="w-6 h-6 text-medical-green" />
                  </div>
                  <h3 className="font-semibold mb-2">Easy Booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Book appointments in seconds with our intuitive interface
                  </p>
                </Card>

                <Card className="text-center p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-medical-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-medical-orange" />
                  </div>
                  <h3 className="font-semibold mb-2">Verified Doctors</h3>
                  <p className="text-sm text-muted-foreground">
                    All doctors are verified and rated by real patients
                  </p>
                </Card>

                <Card className="text-center p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Queue Management</h3>
                  <p className="text-sm text-muted-foreground">
                    No more waiting! See your position and estimated wait time
                  </p>
                </Card>
              </div>
            </div>
          </section>
        </>
      ) : role === "doctor" ? (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage your appointments and track patient arrivals in real-time</p>
          </div>
          
          <DoctorDashboard />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Welcome to AppointLive</h1>
            <p className="text-muted-foreground">Unable to determine user role. Please contact support.</p>
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
