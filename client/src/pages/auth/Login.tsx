  import { useState } from "react";
  import { useLocation } from "wouter";
  import { useAuth } from "@/hooks/use-auth";
  import { useToast } from "@/hooks/use-toast";
  import { ROUTES } from "@/config/constants";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";

  const Login = () => {
    const [location, navigate] = useLocation();
    const { login, isLoading } = useAuth();
    const { toast } = useToast();

    const [loginData, setLoginData] = useState({
      username: "",
      password: "",
    });

    const [errors, setErrors] = useState({
      username: "",
      password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLoginData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name as keyof typeof errors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    };

    const validate = () => {
      const newErrors = {
        username: "",
        password: "",
      };

      if (!loginData.username) {
        newErrors.username = "Email is required";
      }

      if (!loginData.password) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);

      return !newErrors.username && !newErrors.password;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      try {
        console.log("Logging in with:", {
          email: loginData.username,
          password: loginData.password,
        });

        await login({
          email: loginData.username,
          password: loginData.password,
        });

        navigate(ROUTES.HOME);
      } catch (error: any) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    };

    const handleRegisterClick = () => {
      navigate(ROUTES.REGISTER_ROLE);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Kribs</h1>
            <p className="text-neutral-600 mt-2">Find your perfect home</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.username}
                    onChange={handleChange}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-neutral-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={handleRegisterClick}
                      className="text-primary font-medium underline hover:text-primary/80"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default Login;
