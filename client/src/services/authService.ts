// src/services/authService.ts
// NOTE: Ensure your 'users' table has an 'auth_user_id' column of type UUID:
//
//   ALTER TABLE users
//     ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id);
//
import { supabase } from '../config/supabaseClient';
import { User, RegistrationData, UserCredentials } from '../types';

/**
 * Service for handling authentication-related operations
 */
class AuthService {
  /**
   * Login a user with email and password
   */
  async login(credentials: UserCredentials): Promise<User> {
    // Authenticate via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (authError) throw new Error(authError.message);

    const supaUser = authData.user;
    if (!supaUser) throw new Error('Login failed: no user returned');

    // Fetch user profile from custom users table via auth_user_id
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', supaUser.id)
      .single();
    if (profileError) throw new Error(profileError.message || 'Error fetching user profile');

    // Map DB row to User type
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
    // Sign up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password,
    });
    if (authError) throw new Error(authError.message);

    const supaUser = authData.user;
    if (!supaUser) throw new Error('Registration failed: no user created');

    // Insert profile into users table using auth_user_id
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert({
        auth_user_id: supaUser.id,
        email: registrationData.email,
        username: registrationData.username || registrationData.email.split('@')[0],
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        phone: registrationData.phone,
        role: registrationData.role,
        company_name: registrationData.companyName || null,
        license_number: registrationData.licenseNumber || null,
        is_verified: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (profileError) {
      // Cleanup auth if profile insert fails
      await supabase.auth.signOut();
      throw new Error(profileError.message);
    }

    // Map DB row to User type
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
   * Get the current authenticated user profile
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: authData } = await supabase.auth.getUser();
    const supaUser = authData.user;
    if (!supaUser) return null;

    // Fetch profile from users table via auth_user_id
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', supaUser.id)
      .single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Map DB row to User type
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
}

export default new AuthService();
