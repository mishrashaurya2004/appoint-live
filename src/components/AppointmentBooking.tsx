import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  fees: number;
  image: string;
}

interface AppointmentBookingProps {
  doctor: Doctor;
  onClose: () => void;
  onBookingComplete: (appointmentId: string) => void;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
];

const nextDays = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return {
    date: date.toISOString().split('T')[0],
    label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  };
});

export const AppointmentBooking = ({ doctor, onClose, onBookingComplete }: AppointmentBookingProps) => {
  const [selectedDate, setSelectedDate] = useState(nextDays[0].date);
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !patientName || !patientPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    
    // Simulate booking API call
    setTimeout(() => {
      const appointmentId = `apt_${Date.now()}`;
      
      toast({
        title: "Appointment Booked Successfully!",
        description: `Your appointment with Dr. ${doctor.name} is confirmed for ${selectedDate} at ${selectedTime}`,
      });
      
      onBookingComplete(appointmentId);
      setIsBooking(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">
                  Dr. {doctor.name} - {doctor.specialization}
                </p>
              </div>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-medical-blue" />
              <h3 className="font-medium">Select Date</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {nextDays.map((day) => (
                <Badge
                  key={day.date}
                  variant={selectedDate === day.date ? "default" : "outline"}
                  className={`cursor-pointer p-3 justify-center transition-all ${
                    selectedDate === day.date
                      ? "bg-medical-blue text-white shadow-medical"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-medical-green" />
              <h3 className="font-medium">Select Time</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Badge
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`cursor-pointer p-2 justify-center text-xs transition-all ${
                    selectedTime === time
                      ? "bg-medical-green text-white shadow-soft"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-medical-blue" />
              <h3 className="font-medium">Patient Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <Input
                  placeholder="Enter phone number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-medical-green" />
                <label className="text-sm font-medium text-foreground">Symptoms / Reason for visit</label>
              </div>
              <Textarea
                placeholder="Describe your symptoms or reason for consultation..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gradient-card p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span>Dr. {doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between font-medium text-medical-blue">
                <span>Consultation Fee:</span>
                <span>₹{doctor.fees}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="medical" 
              onClick={handleBookAppointment}
              disabled={isBooking || !selectedDate || !selectedTime || !patientName || !patientPhone}
              className="flex-1"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};