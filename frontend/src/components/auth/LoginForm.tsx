import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOTP } from '../../hooks/useOTP';
import { OTPInput } from './OTPInput';
import { authApi } from '../../api';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onShowSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onForgotPassword,
  onShowSignup
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [showPassword, setShowPassword] = useState(false);
  
  const { state: authState, login } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
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
      navigate('/');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      return;
    }
    setIsPasswordLoading(true);
    try {
      const response = await authApi.loginWithPassword(email.trim(), password);
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.session_token);
        onSuccess?.();
        navigate('/');
      } else {
        setLocalError('Incorrect password');
      }
    } catch (err: any) {
      setLocalError('Incorrect password');
    }
    setIsPasswordLoading(false);
  };

  const handleResendOTP = async () => {
    setIsResendLoading(true);
    await otpHook.sendOTP({
      email: email.trim(),
      purpose: 'authentication',
    });
    setIsResendLoading(false);
  };

  const goBackToEmail = () => {
    setStep('email');
    setOtp('');
    otpHook.reset();
  };

  const isLoading = authState.isLoading || otpHook.state.isLoading;
  const error = method === 'password' ? localError : authState.error || otpHook.state.error;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {method === 'otp'
            ? (step === 'email'
                ? 'Enter your email to receive a verification code'
                : 'Enter the verification code sent to your email')
            : 'Sign in using your password'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-4 text-center">
        <button
          type="button"
          onClick={() => {
            setMethod(method === 'otp' ? 'password' : 'otp');
            setStep('email');
            setOtp('');
            setPassword('');
            otpHook.reset();
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {method === 'otp' ? 'Sign in with password instead' : 'Sign in with OTP instead'}
        </button>
      </div>

      {method === 'otp' ? (
        step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Verification Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
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
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )
      ) : (
  <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
            <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
              // Eye open icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 3.866-3.582 7-8 7s-8-3.134-8-7 3.582-7 8-7 8 3.134 8 7z" />
              </svg>
              ) : (
              // Eye closed icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M7.05 7.05A7.001 7.001 0 003 12c0 3.866 3.582 7 8 7a7.001 7.001 0 006.95-4.95M17.94 17.94A7.001 7.001 0 0021 12c0-3.866-3.582-7-8-7a7.001 7.001 0 00-4.95 1.95" />
              </svg>
              )}
            </button>
            </div>
          <button
            type="submit"
            disabled={isPasswordLoading || !email.trim() || !password}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isPasswordLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Forgot your password?
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendLoading}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResendLoading ? 'Resending...' : "Didn't receive the code? Resend"}
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onShowSignup}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
  );
};