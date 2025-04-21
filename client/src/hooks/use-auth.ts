import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/config/constants';

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  companyName?: string;
  licenseNumber?: string;
  isVerified: boolean;
  verificationMethod?: string;
  verificationId?: string;
  createdAt: string;
  avatarUrl?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  companyName?: string;
  licenseNumber?: string;
}

interface AuthContextData {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContextData {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for checking user session
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.SESSION],
    refetchOnWindowFocus: false,
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: false,
  });

  // Set authentication state based on session response
  useEffect(() => {
    if (data && data.authenticated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginData) => {
      const response = await apiRequest('POST', API_ENDPOINTS.LOGIN, loginData);
      return response.json();
    },
    onSuccess: (userData) => {
      setIsAuthenticated(true);
      queryClient.setQueryData([API_ENDPOINTS.SESSION], { authenticated: true, user: userData });
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (registerData: RegisterData) => {
      const response = await apiRequest('POST', API_ENDPOINTS.REGISTER, registerData);
      return response.json();
    },
    onSuccess: (userData) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', API_ENDPOINTS.LOGOUT, {});
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  const login = async (loginData: LoginData) => {
    await loginMutation.mutateAsync(loginData);
  };

  const register = async (registerData: RegisterData) => {
    await registerMutation.mutateAsync(registerData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user: data?.user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: error as Error | null,
    login,
    register,
    logout,
  };
}
