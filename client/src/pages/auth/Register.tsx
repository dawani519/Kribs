import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, USER_ROLES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail, isValidNigerianPhone } from "@/lib/utils";

const Register = () => {
  // Wouter's location doesn't include query strings, use window.location.search
  const [, navigate] = useLocation();
  console.log("Raw window.location.search on mount:", window.location.search);

  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  // Parse role from URL query
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || USER_ROLES.RENTER;
  console.log("Parsed role in Register:", role);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: role,
    companyName: "",
    licenseNumber: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Show/hide fields based on role
  const isLandlord = role === USER_ROLES.LANDLORD;
  const isManager = role === USER_ROLES.MANAGER;
  const showCompanyField = isLandlord || isManager;
  const showLicenseField = isManager;

  // Redirect to role selection if no role
  useEffect(() => {
    if (!role) {
      console.warn("No role provided, redirecting to role selection");
      navigate(ROUTES.REGISTER_ROLE);
    }
  }, [role, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "username", "email", "password", "confirmPassword",
      "firstName", "lastName", "phone"
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !isValidNigerianPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Nigerian phone number";
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (
      formData.password && formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (isManager && !formData.licenseNumber) {
      newErrors.licenseNumber = "License number is required for managers";
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting registration, formData:", formData);

    if (!validate()) {
      console.warn("Validation failed, aborting registration");
      return;
    }

    try {
      // Remove confirmPassword and empty fields
      const { confirmPassword, ...dataToRegister } = formData;
      const cleanData = Object.fromEntries(
        Object.entries(dataToRegister).filter(([_, v]) => v !== "")
      );
      console.log("Clean data to register:", cleanData);

      const result = await register(cleanData);
      console.log("Register result:", result);

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please verify your identity.",
      });
      console.log("Navigating to verification");
      navigate(ROUTES.VERIFICATION);
    } catch (error: any) {
      console.error("Registration Failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToRoleSelection = () => {
    console.log("Going back to role selection");
    navigate(ROUTES.REGISTER_ROLE);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={handleBackToRoleSelection} className="p-2">
            <i className="fas fa-arrow-left text-neutral-600"></i>
          </button>
          <h2 className="text-2xl font-semibold ml-2">Create Account</h2>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
            </div>
            {/* Last Name */}
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
            </div>
          </div>
          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
          </div>
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            <p className="text-xs text-neutral-500">Format: 08012345678 or +2348012345678</p>
          </div>
          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>
          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
          </div>
          {/* Company Name (optional) */}
          {showCompanyField && (
            <div className="space-y-1">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company name"
              />
            </div>
          )}
          {/* License Number (for managers) */}
          {showLicenseField && (
            <div className="space-y-1">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="License number"
                className={errors.licenseNumber ? "border-red-500" : ""}
              />
              {errors.licenseNumber && <p className="text-red-500 text-xs">{errors.licenseNumber}</p>}
            </div>
          )}
          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Continue to Verification"
              )}
            </Button>
          </div>
          {/* Terms */}
          <p className="text-xs text-neutral-500 text-center">
            By registering, you agree to Kribs' <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
