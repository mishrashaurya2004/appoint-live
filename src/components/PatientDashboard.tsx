import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters } from "@/components/SearchFilters";
import { DoctorCard } from "@/components/DoctorCard";
import { AppointmentBooking } from "@/components/AppointmentBooking";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  Bell, 
  MapPin, 
  Phone,
  User,
  CreditCard,
  History,
  Star,
  Search,
  Filter,
  UserCheck,
  UserX,
  SortAsc
} from "lucide-react";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

const mockDoctors = [
  {
    id: "1",
    name: "Dr. Sarah Wilson",
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
    name: "Dr. Michael Chen",
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
    name: "Dr. Emily Rodriguez",
    specialization: "Pediatrician", 
    fees: 600,
    rating: 4.7,
    location: "Andheri East",
    image: doctor3,
    availableSlots: ["11:00 AM", "1:00 PM", "5:00 PM"],
    experience: 15,
  },
  {
    id: "4",
    name: "Dr. Rajesh Kumar",
    specialization: "Dermatologist",
    fees: 750,
    rating: 4.6,
    location: "Powai",
    image: doctor1,
    availableSlots: ["9:30 AM", "12:00 PM", "4:00 PM"],
    experience: 10,
  },
  {
    id: "5",
    name: "Dr. Priya Sharma",
    specialization: "Orthopedist",
    fees: 900,
    rating: 4.9,
    location: "Juhu",
    image: doctor2,
    availableSlots: ["8:00 AM", "10:00 AM", "1:30 PM"],
    experience: 18,
  },
  {
    id: "6",
    name: "Dr. Amit Patel",
    specialization: "Neurologist",
    fees: 1200,
    rating: 4.8,
    location: "Fort",
    image: doctor3,
    availableSlots: ["11:00 AM", "2:30 PM", "5:00 PM"],
    experience: 20,
  },
];

const upcomingAppointments = [
  {
    id: "1",
    doctorName: "Dr. Sarah Wilson",
    specialization: "Cardiologist",
    date: "Today",
    time: "3:00 PM",
    status: "confirmed",
    location: "Mumbai Central"
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    specialization: "General Physician",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "pending",
    location: "Bandra West"
  }
];

const recentAppointments = [
  {
    id: "1",
    doctorName: "Dr. Emily Rodriguez",
    specialization: "Pediatrician",
    date: "Jan 15, 2024",
    time: "2:00 PM",
    status: "completed",
    rating: 5
  },
  {
    id: "2",
    doctorName: "Dr. Rajesh Kumar",
    specialization: "Dermatologist",
    date: "Jan 10, 2024",
    time: "11:30 AM",
    status: "completed",
    rating: 4
  }
];

export const PatientDashboard = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specialists");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*');

      if (error) {
        throw error;
      }

      // Transform database data to match component interface
      const transformedDoctors = data?.map((doctor, index) => ({
        id: doctor.id.toString(),
        name: doctor.name,
        specialization: doctor.specialization,
        fees: doctor.fees,
        rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
        location: doctor.location,
        image: [doctor1, doctor2, doctor3][index % 3], // Cycle through available images
        availableSlots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"], // Default slots
        experience: 5 + Math.floor(Math.random() * 15), // Random experience 5-20 years
      })) || [];

      setDoctors(transformedDoctors);
      setFilteredDoctors(transformedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
      // Fallback to mock data
      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get patient ID
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patientData) return;

      // Fetch all appointments with doctor details
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          slot_time,
          status,
          symptoms,
          reason,
          doctors(name, specialization, location)
        `)
        .eq('patient_id', patientData.id)
        .order('slot_time', { ascending: false });

      if (error) {
        throw error;
      }

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSpecializationFilter = (specialization: string) => {
    setSelectedSpecialization(specialization);
    let filtered = doctors;
    
    if (specialization !== "All Specialists") {
      filtered = doctors.filter(doc => doc.specialization === specialization);
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  };

  const handleLocationFilter = (location: string) => {
    if (location === "Near Me") {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(doc => 
        doc.location.toLowerCase().includes(location.toLowerCase())
      ));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    let filtered = doctors;
    
    if (query) {
      filtered = doctors.filter(doc =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(query.toLowerCase()) ||
        doc.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply specialization filter if selected
    if (selectedSpecialization !== "All Specialists") {
      filtered = filtered.filter(doc => doc.specialization === selectedSpecialization);
    }
    
    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    setSelectedDoctor(doctor);
  };

  const handleBookingComplete = () => {
    setSelectedDoctor(null);
    fetchAppointments(); // Refresh appointments after booking
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Patient Dashboard</h1>
          <p className="text-muted-foreground">Manage your health appointments and discover trusted doctors</p>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover Doctors
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Health Records
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Discover Doctors Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-medical-blue" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{filteredDoctors.length}</p>
                      <p className="text-sm text-muted-foreground">Available Doctors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medical-green/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-medical-green" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">15</p>
                      <p className="text-sm text-muted-foreground">Min Avg Wait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medical-orange/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-medical-orange" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">4.8</p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">8</p>
                      <p className="text-sm text-muted-foreground">Locations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Enhanced Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-card border-0 shadow-medium sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-medical-blue" />
                      Search & Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SearchFilters
                      onSpecializationFilter={handleSpecializationFilter}
                      onLocationFilter={handleLocationFilter}
                      onSearch={handleSearch}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Doctors List */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedSpecialization === "All Specialists" ? "All Doctors" : selectedSpecialization + "s"}
                    </h2>
                    <p className="text-muted-foreground">
                      {searchQuery ? `Search results for "${searchQuery}"` : "Find the right doctor for your needs"}
                    </p>
                  </div>
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

                {filteredDoctors.length === 0 && (
                  <Card className="bg-gradient-card border-0 shadow-soft p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setSelectedSpecialization("All Specialists");
                      setFilteredDoctors(mockDoctors);
                    }}>
                      Reset Filters
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-medical-blue" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments
                    .filter(apt => new Date(apt.slot_time) >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled')
                    .length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No upcoming appointments</p>
                    </div>
                  ) : (
                    appointments
                      .filter(apt => new Date(apt.slot_time) >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled')
                      .map((appointment) => (
                        <div key={appointment.id} className="border-l-4 border-medical-blue pl-4 py-2 bg-background/50 rounded-r-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{appointment.doctors.name}</h4>
                              <p className="text-sm text-muted-foreground">{appointment.doctors.specialization}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(appointment.slot_time).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(appointment.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              {appointment.symptoms && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Symptoms: {appointment.symptoms}
                                </p>
                              )}
                            </div>
                            <Badge variant={appointment.status === "booked" ? "default" : "outline"} className="capitalize">
                              {appointment.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>

              {/* Past Appointments */}
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-medical-green" />
                    Past Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments
                    .filter(apt => new Date(apt.slot_time) < new Date() || apt.status === 'completed' || apt.status === 'cancelled')
                    .length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No past appointments</p>
                    </div>
                  ) : (
                    appointments
                      .filter(apt => new Date(apt.slot_time) < new Date() || apt.status === 'completed' || apt.status === 'cancelled')
                      .slice(0, 5)
                      .map((appointment) => (
                        <div key={appointment.id} className="border-l-4 border-medical-green pl-4 py-2 bg-background/50 rounded-r-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{appointment.doctors.name}</h4>
                              <p className="text-sm text-muted-foreground">{appointment.doctors.specialization}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(appointment.slot_time).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(appointment.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {appointment.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Pressure</span>
                      <span className="font-semibold">120/80 mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Heart Rate</span>
                      <span className="font-semibold">72 bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-semibold">98.6°F</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-medical-blue" />
                    Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cholesterol</span>
                      <span className="font-semibold">180 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Sugar</span>
                      <span className="font-semibold">95 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hemoglobin</span>
                      <span className="font-semibold">13.5 g/dL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-medical-orange" />
                    Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-2 bg-medical-orange/10 rounded-lg">
                      <p className="text-sm font-medium">Annual Checkup Due</p>
                      <p className="text-xs text-muted-foreground">In 2 weeks</p>
                    </div>
                    <div className="p-2 bg-medical-blue/10 rounded-lg">
                      <p className="text-sm font-medium">Prescription Refill</p>
                      <p className="text-xs text-muted-foreground">In 5 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-medical-blue" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-semibold">John Doe</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-semibold">john.doe@example.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-semibold">+91 9876543210</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-semibold">March 15, 1990</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-medical-green" />
                    Payment & Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Primary Insurance</label>
                    <p className="font-semibold">Health Plus Premium</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                    <p className="font-semibold">HP123456789</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="font-semibold">**** **** **** 1234</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Payment Methods
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        {selectedDoctor && (
          <AppointmentBooking
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
    </div>
  );
};