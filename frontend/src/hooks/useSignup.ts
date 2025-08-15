import { useState, useCallback } from 'react';
import { authApi, ApiError, SignupRequest } from '../api';

interface SignupState {
  isLoading: boolean;
  error: string | null;
  isSignupComplete: boolean;
  currentStep: 'form' | 'otp' | 'success';
  email: string;
}

interface UseSignupReturn {
  state: SignupState;
  signup: (data: SignupRequest) => Promise<boolean>;
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

  const signup = useCallback(async (data: SignupRequest): Promise<boolean> => {
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

    // Validate password confirmation
    if (data.password !== data.confirm_password) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Passwords do not match',
      }));
      return false;
    }

    // Validate terms acceptance
    if (!data.terms_accepted) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'You must accept the terms and conditions',
      }));
      return false;
    }

    try {
      const response = await authApi.signup(data);
      
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
    clearError,
    reset,
    goToStep,
  };
};