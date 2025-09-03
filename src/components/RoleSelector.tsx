import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Stethoscope } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelected: (role: "patient" | "doctor") => void;
  availableRoles: ("patient" | "doctor")[];
}

const RoleSelector = ({ onRoleSelected, availableRoles }: RoleSelectorProps) => {
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor">(
    availableRoles.includes("patient") ? "patient" : "doctor"
  );

  const handleContinue = () => {
    onRoleSelected(selectedRole);
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-large">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Role</CardTitle>
        <CardDescription>
          Select how you want to use AppointLive today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {availableRoles.includes("patient") && (
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === "patient" 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedRole("patient")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-medical-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Patient Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Book appointments and track your visits
                  </p>
                </div>
                {selectedRole === "patient" && (
                  <Badge className="ml-auto">Selected</Badge>
                )}
              </div>
            </div>
          )}

          {availableRoles.includes("doctor") && (
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === "doctor" 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedRole("doctor")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-medical-green/10 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-medical-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Doctor Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage appointments and patient care
                  </p>
                </div>
                {selectedRole === "doctor" && (
                  <Badge className="ml-auto">Selected</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleContinue} 
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          Continue as {selectedRole === "patient" ? "Patient" : "Doctor"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleSelector;