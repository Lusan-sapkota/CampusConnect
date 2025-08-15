import { useState, useCallback } from 'react';
import { authApi, ApiError, ResetPasswordRequest } from '../api';
import { useOTP } from './useOTP';

interface PasswordResetState {
  isLoading: boolean;
  error: string | null;
  isResetComplete: boolean;
  currentStep: 'email' | 'otp' | 'password' | 'complete';
  email: string;
}

interface UsePasswordResetReturn {
  state: PasswordResetState;
  otpState: ReturnType<typeof useOTP>['state'];
  sendResetOTP: (email: string, userName?: string) => Promise<boolean>;
  verifyResetOTP: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string, confirmPassword: string, otp: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
  goToStep: (step: PasswordResetState['currentStep']) => void;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [state, setState] = useState<PasswordResetState>({
    isLoading: false,
    error: null,
    isResetComplete: false,
    currentStep: 'email',
    email: '',
  });

  const otp = useOTP();

  const sendResetOTP = useCallback(async (email: string, userName?: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, email }));
    
    const success = await otp.sendOTP({
      email,
      user_name: userName,
      purpose: 'password_reset',
    });

    if (success) {
      setState(prev => ({ ...prev, isLoading: false, currentStep: 'otp' }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: otp.state.error || 'Failed to send reset code' 
      }));
    }

    return success;
  }, [otp]);

  const verifyResetOTP = useCallback(async (otpCode: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const success = await otp.verifyOTP({
      email: state.email,
      otp: otpCode,
      purpose: 'password_reset',
    });

    if (success) {
      setState(prev => ({ ...prev, isLoading: false, currentStep: 'password' }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: otp.state.error || 'Invalid verification code' 
      }));
    }

    return success;
  }, [otp, state.email]);

  const resetPassword = useCallback(async (
    newPassword: string, 
    confirmPassword: string, 
    otpCode: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.resetPassword({
        email: state.email,
        otp: otpCode,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isResetComplete: true,
          currentStep: 'complete',
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to reset password',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Password reset failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.email]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    otp.clearError();
  }, [otp]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isResetComplete: false,
      currentStep: 'email',
      email: '',
    });
    otp.reset();
  }, [otp]);

  const goToStep = useCallback((step: PasswordResetState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  return {
    state,
    otpState: otp.state,
    sendResetOTP,
    verifyResetOTP,
    resetPassword,
    clearError,
    reset,
    goToStep,
  };
};