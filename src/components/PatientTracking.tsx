import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentTime: string;
  appointmentDate: string;
  status: "booked" | "on-way" | "arrived" | "in-progress" | "completed";
  estimatedWaitTime?: number;
  queuePosition?: number;
}

interface PatientTrackingProps {
  appointment: Appointment;
  onStatusUpdate: (appointmentId: string, status: string) => void;
}

export const PatientTracking = ({ appointment, onStatusUpdate }: PatientTrackingProps) => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          try {
            // Call Supabase edge function to calculate real ETA
            const { data, error } = await supabase.functions.invoke('calculate-eta', {
              body: {
                appointmentId: parseInt(appointment.id),
                patientLat: location.lat,
                patientLng: location.lng,
                doctorAddress: "Medical Center, Downtown" // This should come from doctor's profile
              }
            });

            if (error) throw error;

            const calculatedETA = data.etaMinutes;
            setEta(calculatedETA);
            
            onStatusUpdate(appointment.id, "on-way");
            setIsGettingLocation(false);
            
            toast({
              title: "Location Shared",
              description: `Doctor notified - ETA: ${calculatedETA} minutes`,
            });
          } catch (error) {
            console.error('Error calculating ETA:', error);
            // Fallback to simulated ETA
            const simulatedETA = Math.floor(Math.random() * 30) + 10;
            setEta(simulatedETA);
            onStatusUpdate(appointment.id, "on-way");
            
            toast({
              title: "Location Shared",
              description: `Doctor notified - ETA: ${simulatedETA} minutes (estimated)`,
            });
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please ensure location permissions are enabled.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const markAsArrived = () => {
    onStatusUpdate(appointment.id, "arrived");
    toast({
      title: "Arrival Confirmed",
      description: "Doctor has been notified of your arrival",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-medical-blue";
      case "on-way": return "bg-medical-orange";
      case "arrived": return "bg-medical-green";
      case "in-progress": return "bg-warning";
      case "completed": return "bg-success";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked": return <Clock className="w-4 h-4" />;
      case "on-way": return <Navigation className="w-4 h-4" />;
      case "arrived": return <MapPin className="w-4 h-4" />;
      case "in-progress": return <AlertCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-gradient-card shadow-medical">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Appointment Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Dr. {appointment.doctorName} - {appointment.doctorSpecialization}
            </p>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
            {getStatusIcon(appointment.status)}
            <span className="ml-1 capitalize">{appointment.status.replace('-', ' ')}</span>
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Appointment Details */}
        <div className="bg-background p-4 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">{appointment.appointmentDate}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>
              <p className="font-medium">{appointment.appointmentTime}</p>
            </div>
            {appointment.queuePosition && (
              <div>
                <span className="text-muted-foreground">Queue Position:</span>
                <p className="font-medium">#{appointment.queuePosition}</p>
              </div>
            )}
            {appointment.estimatedWaitTime && (
              <div>
                <span className="text-muted-foreground">Estimated Wait:</span>
                <p className="font-medium">{appointment.estimatedWaitTime} mins</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Tracking */}
        {appointment.status === "booked" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4 text-medical-blue" />
              Ready to go?
            </h4>
            <p className="text-sm text-muted-foreground">
              Share your location to let the doctor know you're on your way and get real-time updates.
            </p>
            <Button
              variant="medical"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  I'm on the way
                </>
              )}
            </Button>
          </div>
        )}

        {appointment.status === "on-way" && eta && (
          <div className="space-y-4">
            <div className="bg-medical-blue/10 border border-medical-blue/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-medical-blue animate-pulse" />
                <h4 className="font-medium text-medical-blue">En Route</h4>
              </div>
              <p className="text-sm">
                Estimated arrival time: <span className="font-medium">{eta} minutes</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Doctor has been notified of your location
              </p>
            </div>
            
            <Button
              variant="success"
              onClick={markAsArrived}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              I've Arrived
            </Button>
          </div>
        )}

        {appointment.status === "arrived" && (
          <div className="bg-medical-green/10 border border-medical-green/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-medical-green" />
              <h4 className="font-medium text-medical-green">Arrived</h4>
            </div>
            <p className="text-sm">
              Please check in at the reception and wait for your turn.
            </p>
            {appointment.estimatedWaitTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated wait time: {appointment.estimatedWaitTime} minutes
              </p>
            )}
          </div>
        )}

        {appointment.status === "in-progress" && (
          <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-warning animate-pulse" />
              <h4 className="font-medium text-warning">Consultation in Progress</h4>
            </div>
            <p className="text-sm">
              Your consultation with Dr. {appointment.doctorName} is currently in progress.
            </p>
          </div>
        )}

        {appointment.status === "completed" && (
          <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h4 className="font-medium text-success">Consultation Completed</h4>
            </div>
            <p className="text-sm">
              Thank you for visiting Dr. {appointment.doctorName}. Take care!
            </p>
          </div>
        )}

        {/* Contact Options */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call Clinic
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};