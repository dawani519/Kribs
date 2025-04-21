import { supabase } from '@/config/supabase';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, USER_ROLES } from '@/config/constants';

interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  companyName?: string;
  licenseNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  companyName?: string;
  licenseNumber?: string;
}

interface VerificationData {
  userId: number;
  method: string;
  identificationNumber: string;
  documentUrl?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthUser> {
    // First, create the auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Then, create the user profile in our database
    const response = await apiRequest('POST', API_ENDPOINTS.REGISTER, {
      ...userData,
      supabaseUserId: authData.user?.id,
    });

    return response.json();
  }

  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Get user profile from our database
    const response = await apiRequest('POST', API_ENDPOINTS.LOGIN, {
      email: credentials.email,
      supabaseUserId: authData.user?.id,
    });

    return response.json();
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    // Clear session from our database
    await apiRequest('POST', API_ENDPOINTS.LOGOUT, undefined);
  }

  /**
   * Get the current user session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiRequest('GET', API_ENDPOINTS.SESSION, undefined);
      const data = await response.json();
      
      if (data.authenticated) {
        return data.user;
      }
      
      return null;
    } catch (error) {
      // If there's an error, assume the user is not authenticated
      return null;
    }
  }

  /**
   * Check if the current user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await apiRequest('GET', API_ENDPOINTS.SESSION, undefined);
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the current user has a specific role
   */
  async hasRole(role: string | string[]): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return false;
      }
      
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      
      return user.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Submit verification for the current user
   */
  async submitVerification(verificationData: VerificationData): Promise<any> {
    const response = await apiRequest('POST', API_ENDPOINTS.VERIFICATION, verificationData);
    return response.json();
  }

  /**
   * Check verification status for the current user
   */
  async checkVerificationStatus(): Promise<any> {
    const response = await apiRequest('GET', API_ENDPOINTS.VERIFICATION, undefined);
    return response.json();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Complete password reset with new password
   */
  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<AuthUser>): Promise<AuthUser> {
    const response = await apiRequest('PUT', API_ENDPOINTS.PROFILE, userData);
    return response.json();
  }

  /**
   * Check if email already exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiRequest('GET', `${API_ENDPOINTS.CHECK_EMAIL}?email=${encodeURIComponent(email)}`, undefined);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Get user roles
   */
  getRoles(): Record<string, string> {
    return USER_ROLES;
  }
}

export default new AuthService();