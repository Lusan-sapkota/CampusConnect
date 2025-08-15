import { useState, useCallback } from 'react';
import { authApi, ApiError, SignupRequest, SimpleSignupRequest } from '../api';

interface SignupState {
  isLoading: boolean;
  error: string | null;
  isSignupComplete: boolean;
  currentStep: 'form' | 'otp' | 'success';
  email: string;
}

interface UseSignupReturn {
  state: SignupState;
  signup: (data: SignupRequest | SimpleSignupRequest) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
  goToStep: (step: SignupState['currentStep']) => void;
}

// Allowed email domains for campus
const ALLOWED_EMAIL_DOMAINS = [
  'student.university.edu',
  'university.edu',
  'campus.edu',
  'college.edu',
  // Add more domains as needed
];

export const useSignup = (): UseSignupReturn => {
  const [state, setState] = useState<SignupState>({
    isLoading: false,
    error: null,
    isSignupComplete: false,
    currentStep: 'form',
    email: '',
  });

  const validateEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const signup = useCallback(async (data: SignupRequest | SimpleSignupRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, email: data.email }));
    
    // Validate email domain
    if (!validateEmail(data.email)) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Email must be from an approved campus domain: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`,
      }));
      return false;
    }

    // Validate password
    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length > 0) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: passwordErrors.join('. '),
      }));
      return false;
    }

    // Handle different signup request types
    if ('confirm_password' in data) {
      // Simple signup request validation
      if (data.password !== data.confirm_password) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Passwords do not match',
        }));
        return false;
      }

      if (!data.terms_accepted) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'You must accept the terms and conditions',
        }));
        return false;
      }
    }

    try {
      // For now, simulate sending OTP for complete signup
      if ('firstName' in data) {
        // Complete signup - simulate OTP sending
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: 'otp',
        }));
        return true;
      } else {
        // Simple signup - use existing API
        const response = await authApi.signup(data as SimpleSignupRequest);
        
        if (response.success) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isSignupComplete: true,
            currentStep: 'success',
          }));
          return true;
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: response.message || 'Signup failed',
          }));
          return false;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Signup failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // For now, simulate OTP verification
      // In a real app, this would call the API
      if (otp === '123456' || otp.length === 6) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isSignupComplete: true,
          currentStep: 'success',
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid OTP code',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'OTP verification failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSignupComplete: false,
      currentStep: 'form',
      email: '',
    });
  }, []);

  const goToStep = useCallback((step: SignupState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  return {
    state,
    signup,
    verifyOTP,
    clearError,
    reset,
    goToStep,
  };
};