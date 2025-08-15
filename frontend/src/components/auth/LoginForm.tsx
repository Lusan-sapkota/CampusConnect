import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOTP } from '../../hooks/useOTP';
import { OTPInput } from './OTPInput';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onForgotPassword 
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  const { state: authState, login } = useAuth();
  const otpHook = useOTP();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    const success = await otpHook.sendOTP({
      email: email.trim(),
      purpose: 'authentication',
    });

    if (success) {
      setStep('otp');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      return;
    }

    const success = await login(email, otp);
    
    if (success) {
      onSuccess?.();
    }
  };

  const handleResendOTP = async () => {
    await otpHook.sendOTP({
      email: email.trim(),
      purpose: 'authentication',
    });
  };

  const goBackToEmail = () => {
    setStep('email');
    setOtp('');
    otpHook.reset();
  };

  const isLoading = authState.isLoading || otpHook.state.isLoading;
  const error = authState.error || otpHook.state.error;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-gray-600 mt-2">
          {step === 'email' 
            ? 'Enter your email to receive a verification code'
            : 'Enter the verification code sent to your email'
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Verification Code
            </label>
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Code sent to {email}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBackToEmail}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !otp || otp.length < 4}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
};