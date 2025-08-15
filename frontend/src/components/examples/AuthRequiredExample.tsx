import React from 'react';
import { AuthRequiredButton } from '../auth/AuthRequiredButton';
import { useAuthAction } from '../../hooks/useAuthAction';

// Example component showing how to use authentication-required actions
export const AuthRequiredExample: React.FC = () => {
  const { requireAuth, isAuthenticated } = useAuthAction();

  const handleJoinEvent = () => {
    // This action will only execute if user is authenticated
    console.log('Joining event...');
    // Add your join event logic here
  };

  const handleJoinGroup = () => {
    console.log('Joining group...');
    // Add your join group logic here
  };

  const handleLikePost = () => {
    console.log('Liking post...');
    // Add your like post logic here
  };

  // Example of using requireAuth directly
  const handleDirectAction = () => {
    requireAuth(() => {
      console.log('This action requires authentication');
    }, 'Please sign in to perform this action');
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Authentication Required Actions
      </h3>
      
      {/* Using AuthRequiredButton component */}
      <div className="space-y-2">
        <AuthRequiredButton
          onClick={handleJoinEvent}
          message="Please sign in to join events"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Join Event
        </AuthRequiredButton>

        <AuthRequiredButton
          onClick={handleJoinGroup}
          message="Please sign in to join groups"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Join Group
        </AuthRequiredButton>

        <AuthRequiredButton
          onClick={handleLikePost}
          message="Please sign in to like posts"
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Like Post
        </AuthRequiredButton>
      </div>

      {/* Using requireAuth hook directly */}
      <button
        onClick={handleDirectAction}
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
      >
        Direct Auth Action
      </button>

      {/* Show authentication status */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Authentication Status: {isAuthenticated ? '✅ Signed In' : '❌ Not Signed In'}
        </p>
      </div>
    </div>
  );
};