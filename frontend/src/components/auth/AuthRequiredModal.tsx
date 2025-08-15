import React from 'react';
import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string; // e.g., "join this event", "like this post", "join this group"
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ isOpen, onClose, action }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You need to be signed in to {action}.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join CampusConnect to connect with your campus community!
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSignIn}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;