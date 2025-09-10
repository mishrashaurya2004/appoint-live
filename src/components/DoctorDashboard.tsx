import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, Navigation, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PatientAppointment {
  id: number;
  patientName: string;
  appointmentTime: string;
  status: "booked" | "on-way" | "arrived" | "in-progress" | "completed" | "no-show";
  eta?: number;
  symptoms: string;
  phone: string;
  queuePosition: number;
  slotTime: string;
}


export const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Get doctor ID from doctors table
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorError) {
        console.error('Doctor not found:', doctorError);
        return;
      }

      // Fetch appointments for today with patient details
      const today = new Date().toISOString().split('T')[0];
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          slot_time,
          status,
          patients!inner(name, phone)
        `)
        .eq('doctor_id', doctorData.id)
        .gte('slot_time', `${today}T00:00:00`)
        .lt('slot_time', `${today}T23:59:59`)
        .order('slot_time', { ascending: true });

      if (appointmentsError) {
        throw appointmentsError;
      }

      // Transform data to match component interface
      const transformedAppointments: PatientAppointment[] = appointmentsData?.map((apt, index) => ({
        id: apt.id,
        patientName: apt.patients.name,
        phone: apt.patients.phone,
        appointmentTime: new Date(apt.slot_time).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        slotTime: apt.slot_time,
        status: apt.status as PatientAppointment['status'],
        symptoms: "General consultation", // Default since we don't store symptoms yet
        queuePosition: index + 1,
      })) || [];

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: newStatus as PatientAppointment["status"] }
            : apt
        )
      );

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-medical-blue text-white";
      case "on-way": return "bg-medical-orange text-white";
      case "arrived": return "bg-medical-green text-white";
      case "in-progress": return "bg-warning text-white";
      case "completed": return "bg-success text-white";
      case "no-show": return "bg-destructive text-white";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked": return <Clock className="w-4 h-4" />;
      case "on-way": return <Navigation className="w-4 h-4" />;
      case "arrived": return <MapPin className="w-4 h-4" />;
      case "in-progress": return <Users className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "no-show": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalPatients = appointments.length;
  const patientsOnWay = appointments.filter(apt => apt.status === "on-way").length;
  const patientsArrived = appointments.filter(apt => apt.status === "arrived").length;
  const currentPatient = appointments.find(apt => apt.status === "in-progress");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Today</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-success text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Arrived</p>
                <p className="text-2xl font-bold">{patientsArrived}</p>
              </div>
              <MapPin className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-medical-orange text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">On the way</p>
                <p className="text-2xl font-bold">{patientsOnWay}</p>
              </div>
              <Navigation className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Current Time</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Patient */}
      {currentPatient && (
        <Card className="bg-warning/10 border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Users className="w-5 h-5" />
              Current Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentPatient.patientName}</h3>
                <p className="text-sm text-muted-foreground">{currentPatient.symptoms}</p>
                <p className="text-sm text-warning font-medium mt-1">
                  {currentPatient.appointmentTime} - In Progress
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => updateAppointmentStatus(currentPatient.id, "completed")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-medical-blue" />
            Patient Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments
              .filter(apt => apt.status !== "completed")
              .sort((a, b) => a.queuePosition - b.queuePosition)
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-medical-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {appointment.queuePosition}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">
                            {appointment.status.replace('-', ' ')}
                          </span>
                        </Badge>
                        {appointment.eta && (
                          <Badge variant="outline" className="text-medical-orange border-medical-orange">
                            ETA: {appointment.eta}m
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                      <p className="text-xs text-medical-blue font-medium">
                        {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {appointment.status === "arrived" && (
                      <Button
                        variant="medical"
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, "in-progress")}
                      >
                        Start Consultation
                      </Button>
                    )}
                    
                    {appointment.status === "booked" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, "no-show")}
                      >
                        Mark No-Show
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};