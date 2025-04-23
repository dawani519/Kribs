import { supabase } from '../config/supabaseClient';
import { User, UserCredentials, RegistrationData } from '../types';

/**
 * Service for handling authentication-related operations
 */
class AuthService {
  /**
   * Login a user with email and password
   */
  async login(credentials: UserCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');

    // Get user profile data
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      role: userData.role,
      companyName: userData.company_name,
      licenseNumber: userData.license_number,
      isVerified: userData.is_verified,
      verificationMethod: userData.verification_method,
      verificationId: userData.verification_id,
      createdAt: userData.created_at,
      avatarUrl: userData.avatar_url,
    };
  }

  /**
   * Register a new user
   */
  async register(registrationData: RegistrationData): Promise<User> {
    // Create auth record
    const { data, error } = await supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    // Create user profile
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: registrationData.email,
        username: registrationData.email.split('@')[0], // Default username from email
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        phone: registrationData.phone,
        role: registrationData.role,
        company_name: registrationData.companyName,
        license_number: registrationData.licenseNumber,
        is_verified: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      // Cleanup auth record if profile creation fails
      await supabase.auth.signOut();
      throw new Error(profileError.message);
    }

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      role: userData.role,
      companyName: userData.company_name,
      licenseNumber: userData.license_number,
      isVerified: userData.is_verified,
      verificationMethod: userData.verification_method,
      verificationId: userData.verification_id,
      createdAt: userData.created_at,
      avatarUrl: userData.avatar_url,
    };
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    // Get user profile data
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      role: userData.role,
      companyName: userData.company_name,
      licenseNumber: userData.license_number,
      isVerified: userData.is_verified,
      verificationMethod: userData.verification_method,
      verificationId: userData.verification_id,
      createdAt: userData.created_at,
      avatarUrl: userData.avatar_url,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    // Convert from camelCase to snake_case for database
    const dbData: any = {
      username: userData.username,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      company_name: userData.companyName,
      license_number: userData.licenseNumber,
      avatar_url: userData.avatarUrl,
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined) {
        delete dbData[key];
      }
    });

    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      email: data.email,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      companyName: data.company_name,
      licenseNumber: data.license_number,
      isVerified: data.is_verified,
      verificationMethod: data.verification_method,
      verificationId: data.verification_id,
      createdAt: data.created_at,
      avatarUrl: data.avatar_url,
    };
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    // This is a mock implementation because Supabase doesn't provide a direct way to check
    // We'll use signIn with invalid password and check the error message
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'check_email_exists_dummy_password',
    });

    // If error message mentions "Invalid login credentials", the email exists
    return error?.message?.includes('Invalid login credentials') || false;
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) throw new Error(error.message);
  }

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw new Error(error.message);
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;