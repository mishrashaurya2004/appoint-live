import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Phone } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  fees: number;
  rating: number;
  location: string;
  image: string;
  availableSlots: string[];
  experience: number;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctorId: string) => void;
}

export const DoctorCard = ({ doctor, onBookAppointment }: DoctorCardProps) => {
  return (
    <Card className="bg-gradient-card hover:shadow-medical transition-all duration-300 border-0 animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-soft">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{doctor.name}</h3>
                <p className="text-medical-blue font-medium">{doctor.specialization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-sm text-muted-foreground">{doctor.experience} years exp</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-medical-blue">₹{doctor.fees}</div>
                <div className="text-sm text-muted-foreground">Consultation</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{doctor.location}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-medical-green" />
              <div className="flex gap-1">
                {doctor.availableSlots.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {slot}
                  </Badge>
                ))}
                {doctor.availableSlots.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{doctor.availableSlots.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="appointment"
                size="sm"
                className="flex-1"
                onClick={() => onBookAppointment(doctor.id)}
              >
                Book Appointment
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};