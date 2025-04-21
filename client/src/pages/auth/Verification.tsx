import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useVerification } from "@/hooks/use-verification";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, VERIFICATION_METHODS } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Verification = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { verifyWithNIN, verifyWithBVN, isVerifying } = useVerification();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<string | null>(null);
  const [ninNumber, setNinNumber] = useState("");
  const [bvnNumber, setBvnNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSelectMethod = (selectedMethod: string) => {
    setMethod(selectedMethod);
    // Clear errors when changing methods
    setErrors({});
  };
  
  const validateNIN = () => {
    const newErrors: Record<string, string> = {};
    
    if (!ninNumber) {
      newErrors.ninNumber = "NIN is required";
    } else if (!/^\d{11}$/.test(ninNumber)) {
      newErrors.ninNumber = "NIN must be 11 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateBVN = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bvnNumber) {
      newErrors.bvnNumber = "BVN is required";
    } else if (!/^\d{11}$/.test(bvnNumber)) {
      newErrors.bvnNumber = "BVN must be 11 digits";
    }
    
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleVerify = async () => {
    if (method === VERIFICATION_METHODS.NIN) {
      if (!validateNIN()) return;
      
      try {
        await verifyWithNIN(ninNumber);
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified using NIN.",
        });
        navigate(ROUTES.HOME);
      } catch (error: any) {
        toast({
          title: "Verification Failed",
          description: error.message || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } else if (method === VERIFICATION_METHODS.BVN) {
      if (!validateBVN()) return;
      
      try {
        await verifyWithBVN(bvnNumber, dateOfBirth);
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified using BVN.",
        });
        navigate(ROUTES.HOME);
      } catch (error: any) {
        toast({
          title: "Verification Failed",
          description: error.message || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Method Selected",
        description: "Please select a verification method first.",
        variant: "destructive",
      });
    }
  };
  
  const handleSkip = () => {
    toast({
      title: "Verification Skipped",
      description: "You can verify your identity later. Some features may be limited.",
    });
    navigate(ROUTES.HOME);
  };
  
  const handleBack = () => {
    navigate(ROUTES.LOGIN);
  };
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="p-2">
            <i className="fas fa-arrow-left text-neutral-600"></i>
          </button>
          <h2 className="text-2xl font-semibold ml-2">Identity Verification</h2>
        </div>
        
        <div className="space-y-6">
          {/* Benefits Card */}
          <Card className="bg-neutral-100 border-0">
            <CardContent className="pt-4">
              <p className="text-neutral-700">Verify your identity to unlock full access to Kribs.</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                  <span className="text-sm">Lower contact fees</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                  <span className="text-sm">Priority access to new listings</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                  <span className="text-sm">Trusted user badge</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Verification Method Selection */}
          <div className="space-y-4">
            <p className="font-medium">Verification Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectMethod(VERIFICATION_METHODS.NIN)}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary transition-colors ${
                  method === VERIFICATION_METHODS.NIN
                    ? "border-primary bg-primary bg-opacity-10"
                    : "border-neutral-300"
                }`}
              >
                <i className={`fas fa-id-card text-2xl mb-2 ${
                  method === VERIFICATION_METHODS.NIN ? "text-primary" : "text-neutral-600"
                }`}></i>
                <span className="text-sm font-medium">NIN</span>
              </button>
              
              <button
                onClick={() => handleSelectMethod(VERIFICATION_METHODS.BVN)}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary transition-colors ${
                  method === VERIFICATION_METHODS.BVN
                    ? "border-primary bg-primary bg-opacity-10"
                    : "border-neutral-300"
                }`}
              >
                <i className={`fas fa-credit-card text-2xl mb-2 ${
                  method === VERIFICATION_METHODS.BVN ? "text-primary" : "text-neutral-600"
                }`}></i>
                <span className="text-sm font-medium">BVN</span>
              </button>
            </div>
          </div>
          
          {/* NIN Verification Form */}
          {method === VERIFICATION_METHODS.NIN && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nin-number">NIN Number</Label>
                <Input
                  id="nin-number"
                  value={ninNumber}
                  onChange={(e) => {
                    setNinNumber(e.target.value);
                    if (errors.ninNumber) {
                      setErrors((prev) => ({ ...prev, ninNumber: "" }));
                    }
                  }}
                  placeholder="Enter your NIN"
                  className={errors.ninNumber ? "border-red-500" : ""}
                />
                {errors.ninNumber && (
                  <p className="text-red-500 text-xs">{errors.ninNumber}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Selfie with ID (Optional)</Label>
                <div 
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer"
                >
                  <i className="fas fa-camera text-3xl text-neutral-400 mb-2"></i>
                  <p className="text-sm text-neutral-500">Take a photo holding your ID</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
                    type="button"
                  >
                    Upload Photo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      // Handle file upload in a real app
                      console.log('File selected:', e.target.files?.[0]);
                    }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  *For additional security. We'll delete this after verification.
                </p>
              </div>
            </div>
          )}
          
          {/* BVN Verification Form */}
          {method === VERIFICATION_METHODS.BVN && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="bvn-number">BVN Number</Label>
                <Input
                  id="bvn-number"
                  value={bvnNumber}
                  onChange={(e) => {
                    setBvnNumber(e.target.value);
                    if (errors.bvnNumber) {
                      setErrors((prev) => ({ ...prev, bvnNumber: "" }));
                    }
                  }}
                  placeholder="Enter your BVN"
                  className={errors.bvnNumber ? "border-red-500" : ""}
                />
                {errors.bvnNumber && (
                  <p className="text-red-500 text-xs">{errors.bvnNumber}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    if (errors.dateOfBirth) {
                      setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                    }
                  }}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <Button
              onClick={handleVerify}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Complete Verification"
              )}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full"
              disabled={isVerifying}
            >
              Skip for now
            </Button>
          </div>
          
          <p className="text-xs text-neutral-500 text-center">
            Your data is securely encrypted and only used for verification purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;
