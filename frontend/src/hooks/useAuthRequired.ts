import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UseAuthRequiredReturn {
  showAuthModal: boolean;
  authAction: string;
  requireAuth: (action: string, callback?: () => void) => boolean;
  closeAuthModal: () => void;
}

export const useAuthRequired = (): UseAuthRequiredReturn => {
  const { state } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const requireAuth = (action: string, callback?: () => void): boolean => {
    if (state.isAuthenticated) {
      // User is authenticated, execute callback immediately
      if (callback) callback();
      return true;
    } else {
      // User is not authenticated, show modal
      setAuthAction(action);
      setShowAuthModal(true);
      if (callback) setPendingCallback(() => callback);
      return false;
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthAction('');
    setPendingCallback(null);
  };

  return {
    showAuthModal,
    authAction,
    requireAuth,
    closeAuthModal,
  };
};