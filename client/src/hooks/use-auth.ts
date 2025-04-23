import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { supabase } from '../config/supabaseClient';
import { UserCredentials, RegistrationData, UserProfile } from '../types';

/**
 * Custom hook for authentication functionality
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const [checking, setChecking] = useState(true);
  
  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setChecking(true);
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // Get user profile from database
          // This would normally dispatch an action to fetch the user profile
          console.log('User is authenticated:', data.session.user);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setChecking(false);
      }
    };
    
    checkSession();
  }, [dispatch]);
  
  // Login with email and password
  const login = async (credentials: UserCredentials) => {
    try {
      // Using Supabase for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a full implementation, we would dispatch an action to update the Redux state
      console.log('User logged in:', data.user);
      
      return data.user;
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    }
  };
  
  // Register a new user
  const register = async (userData: RegistrationData) => {
    try {
      // Using Supabase for authentication
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone_number: userData.phoneNumber,
            role: userData.role,
          },
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a full implementation, we would dispatch an action to update the Redux state
      console.log('User registered:', data.user);
      
      return data.user;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };
  
  // Logout the current user
  const logout = async () => {
    try {
      // Using Supabase for authentication
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a full implementation, we would dispatch an action to update the Redux state
      console.log('User logged out');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };
  
  // Update user profile
  const updateProfile = async (userData: Partial<UserProfile>) => {
    try {
      // Using Supabase for updating profile
      const { data, error } = await supabase.auth.updateUser({
        data: userData,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a full implementation, we would dispatch an action to update the Redux state
      console.log('Profile updated:', data.user);
      
      return data.user;
    } catch (error: any) {
      console.error('Update profile error:', error.message);
      throw error;
    }
  };
  
  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      // In a full implementation, we would dispatch an action to check the verification status
      console.log('Checking verification status');
      return auth.verificationStatus;
    } catch (error: any) {
      console.error('Check verification status error:', error.message);
      throw error;
    }
  };
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || checking,
    error: auth.error,
    verificationStatus: auth.verificationStatus,
    login,
    register,
    logout,
    updateProfile,
    checkVerificationStatus,
  };
};

export default useAuth;