import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import CompleteSignupForm from '../components/auth/CompleteSignupForm';

type AuthView = 'login' | 'signup' | 'complete-signup' | 'forgot-password';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  const handleShowSignup = () => {
    setCurrentView('complete-signup'); // Use the complete signup form by default
  };

  const handleShowForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {currentView === 'login' && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CampusConnect</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with your campus community</p>
          </div>
        </div>
      )}

      <div className={`mt-8 sm:mx-auto sm:w-full ${currentView === 'complete-signup' ? 'sm:max-w-4xl' : 'sm:max-w-md'}`}>
        {currentView === 'login' && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onForgotPassword={handleShowForgotPassword}
            onShowSignup={handleShowSignup}
          />
        )}

        {currentView === 'complete-signup' && (
          <CompleteSignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={handleBackToLogin}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm
            onSuccess={handleBackToLogin}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Secure authentication powered by email verification
        </p>
      </div>
    </div>
  );
};