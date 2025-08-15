import { useState, useCallback } from 'react';
import { authApi, ApiError, SendOTPRequest, VerifyOTPRequest } from '../api';

interface OTPState {
  isLoading: boolean;
  error: string | null;
  isOTPSent: boolean;
  isOTPVerified: boolean;
  expiryMinutes?: number;
}

interface UseOTPReturn {
  state: OTPState;
  sendOTP: (data: SendOTPRequest) => Promise<boolean>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useOTP = (): UseOTPReturn => {
  const [state, setState] = useState<OTPState>({
    isLoading: false,
    error: null,
    isOTPSent: false,
    isOTPVerified: false,
  });

  const sendOTP = useCallback(async (data: SendOTPRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.sendOTP(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isOTPSent: true,
          expiryMinutes: response.data?.expiry_minutes,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to send OTP',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to send OTP';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const verifyOTP = useCallback(async (data: VerifyOTPRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.verifyOTP(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isOTPVerified: true,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Invalid OTP',
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
      isOTPSent: false,
      isOTPVerified: false,
    });
  }, []);

  return {
    state,
    sendOTP,
    verifyOTP,
    clearError,
    reset,
  };
};