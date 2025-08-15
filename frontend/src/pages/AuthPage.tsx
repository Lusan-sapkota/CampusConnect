import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'forgot-password';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  const handleShowForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CampusConnect</h1>
          <p className="text-gray-600">Connect with your campus community</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {currentView === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onForgotPassword={handleShowForgotPassword}
          />
        ) : (
          <ForgotPasswordForm
            onSuccess={handleBackToLogin}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Secure authentication powered by email verification
        </p>
      </div>
    </div>
  );
};