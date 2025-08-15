import React from 'react';
import { UserProfile } from '../components/auth/UserProfile';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserProfile />
      </div>
    </div>
  );
};