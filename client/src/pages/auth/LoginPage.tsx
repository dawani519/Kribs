import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import { UserCredentials } from '../../types';
import { ROUTES } from '../../config/constants';
import { APP_NAME } from '../../config/constants';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';

const LoginPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { login, isLoading } = useAuth();
  
  const [credentials, setCredentials] = useState<UserCredentials>({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(credentials);
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">{APP_NAME}</h1>
          <p className="mt-2 text-neutral-600">Sign in to your account</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2">Signing in</span>
                  <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.REGISTER_ROLE)}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;