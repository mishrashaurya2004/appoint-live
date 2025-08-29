import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, Navigation, Phone, CheckCircle, AlertTriangle, Stethoscope, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DoctorDashboardProps {
  onSwitchToPatient: () => void;
}

interface PatientAppointment {
  id: string;
  patientName: string;
  appointmentTime: string;
  status: "booked" | "on-way" | "arrived" | "in-progress" | "completed" | "no-show";
  eta?: number;
  symptoms: string;
  phone: string;
  queuePosition: number;
}

const mockAppointments: PatientAppointment[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    appointmentTime: "10:00 AM",
    status: "in-progress",
    symptoms: "Regular checkup and blood pressure monitoring",
    phone: "+1 234-567-8901",
    queuePosition: 1,
  },
  {
    id: "2",
    patientName: "Michael Chen",
    appointmentTime: "10:30 AM",
    status: "on-way",
    eta: 15,
    symptoms: "Chest pain and shortness of breath",
    phone: "+1 234-567-8902",
    queuePosition: 2,
  },
  {
    id: "3",
    patientName: "Emily Davis",
    appointmentTime: "11:00 AM",
    status: "arrived",
    symptoms: "Follow-up for diabetes management",
    phone: "+1 234-567-8903",
    queuePosition: 3,
  },
  {
    id: "4",
    patientName: "James Wilson",
    appointmentTime: "11:30 AM",
    status: "booked",
    symptoms: "Annual physical examination",
    phone: "+1 234-567-8904",
    queuePosition: 4,
  },
];

const DoctorDashboard = ({ onSwitchToPatient }: DoctorDashboardProps) => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>(mockAppointments);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus as PatientAppointment["status"] }
          : apt
      )
    );
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onSwitchToPatient}>
                <User className="h-4 w-4 mr-2" />
                Switch to Patient View
              </Button>
              <Button variant="destructive" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                      variant="default"
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
                            variant="default"
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
      </main>
    </div>
  );
};

export default DoctorDashboard;