import { useState } from "react";
import { useLocation } from "wouter";
import { ROUTES, USER_ROLES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Role {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const RegisterRole = () => {
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles: Role[] = [
    {
      id: USER_ROLES.RENTER,
      title: "Renter",
      icon: "fas fa-home",
      description: "I'm looking for a property to rent."
    },
    {
      id: USER_ROLES.LANDLORD,
      title: "Landlord",
      icon: "fas fa-key",
      description: "I have property to rent out."
    },
    {
      id: USER_ROLES.MANAGER,
      title: "Manager",
      icon: "fas fa-building",
      description: "I manage properties for others."
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`${ROUTES.REGISTER}?role=${selectedRole}`);
    }
  };

  const handleBackToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={handleBackToLogin} className="p-2">
            <i className="fas fa-arrow-left text-neutral-600"></i>
          </button>
          <h2 className="text-2xl font-semibold ml-2">Create Account</h2>
        </div>
        
        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-neutral-700 mb-3 font-medium">I am a:</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary transition-colors ${
                  selectedRole === role.id 
                    ? "border-primary bg-primary bg-opacity-10" 
                    : "border-neutral-300"
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <i className={`${role.icon} text-2xl mb-2 ${
                  selectedRole === role.id ? "text-primary" : "text-neutral-600"
                }`}></i>
                <span className="text-sm font-medium">{role.title}</span>
              </button>
            ))}
          </div>
          
          <p className="text-sm text-neutral-500 mt-4">
            {selectedRole && 
              roles.find(r => r.id === selectedRole)?.description}
          </p>
        </div>
        
        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!selectedRole}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default RegisterRole;
