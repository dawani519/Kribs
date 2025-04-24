import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchCurrentUser, login, logout, register } from '../redux/authSlice';
import { UserCredentials, RegistrationData } from '../types';

/**
 * Hook for handling authentication-related functionality
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for current user on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [dispatch]);
  
  // Login method
  const handleLogin = async (credentials: UserCredentials) => {
    try {
      return await dispatch(login(credentials)).unwrap();
    } catch (error) {
      throw error;
    }
  };
  
  // Register method
  const handleRegister = async (userData: RegistrationData) => {
    try {
      return await dispatch(register(userData)).unwrap();
    } catch (error) {
      throw error;
    }
  };
  
  // Logout method
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  
  return {
    user: auth.user,
    isAuthenticated: !!auth.user,
    isLoading: isLoading || auth.isLoading,
    error: auth.error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };
};