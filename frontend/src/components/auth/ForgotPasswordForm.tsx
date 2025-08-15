import React, { useState } from 'react';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { OTPInput } from './OTPInput';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const {
    state,
    otpState,
    sendResetOTP,
    verifyResetOTP,
    resetPassword,
    clearError,
    reset,
    goToStep,
  } = usePasswordReset();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    const success = await sendResetOTP(email.trim(), userName.trim() || undefined);
    
    if (!success) {
      // Error is already handled by the hook
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      return;
    }

    const success = await verifyResetOTP(otp);
    
    if (!success) {
      // Error is already handled by the hook
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    const success = await resetPassword(newPassword, confirmPassword, otp);
    
    if (success) {
      onSuccess?.();
    }
  };

  const handleResendOTP = async () => {
    await sendResetOTP(state.email, userName.trim() || undefined);
  };

  const handleStartOver = () => {
    reset();
    setEmail('');
    setUserName('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const isLoading = state.isLoading;
  const error = state.error;

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address *
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

      <div>
  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name (Optional)
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          placeholder="Enter your name"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? 'Sending...' : 'Send Reset Code'}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
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
          Reset code sent to {state.email}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep('email')}
          disabled={isLoading}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !otp || otp.length < 4}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          placeholder="Enter new password"
        />
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Must be at least 8 characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      <div>
  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          placeholder="Confirm new password"
        />
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep('otp')}
          disabled={isLoading}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={
            isLoading || 
            !newPassword || 
            !confirmPassword || 
            newPassword !== confirmPassword
          }
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-4">
  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password Reset Successful!</h3>
  <p className="text-gray-600 dark:text-gray-400">
        Your password has been successfully reset. You can now sign in with your new password.
      </p>
      <button
        onClick={onBackToLogin}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Back to Sign In
      </button>
    </div>
  );

  return (
  <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
  <p className="text-gray-600 dark:text-gray-400 mt-2">
          {state.currentStep === 'email' && 'Enter your email to receive a reset code'}
          {state.currentStep === 'otp' && 'Enter the verification code'}
          {state.currentStep === 'password' && 'Create your new password'}
          {state.currentStep === 'complete' && 'Password reset complete'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {state.currentStep === 'email' && renderEmailStep()}
      {state.currentStep === 'otp' && renderOTPStep()}
      {state.currentStep === 'password' && renderPasswordStep()}
      {state.currentStep === 'complete' && renderCompleteStep()}

      {state.currentStep !== 'complete' && (
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Back to Sign In
          </button>
          {state.currentStep !== 'email' && (
            <div>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};