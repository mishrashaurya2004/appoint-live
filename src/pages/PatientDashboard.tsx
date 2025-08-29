import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, User, Stethoscope } from "lucide-react";

interface PatientDashboardProps {
  onSwitchToDoctor: () => void;
}

const PatientDashboard = ({ onSwitchToDoctor }: PatientDashboardProps) => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Patient Portal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSwitchToDoctor}>
              <Stethoscope className="h-4 w-4 mr-2" />
              Switch to Doctor View
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Cardiology</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Today, 2:30 PM</span>
                    </div>
                  </div>
                  <Badge>Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Dermatology</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Tomorrow, 10:00 AM</span>
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearby Doctors
              </Button>
              <Button className="w-full" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
              <CardDescription>Your health overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Last Visit</span>
                  <span className="text-sm font-medium">2 weeks ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Upcoming Tests</span>
                  <span className="text-sm font-medium">Blood work</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prescriptions</span>
                  <span className="text-sm font-medium">2 active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;