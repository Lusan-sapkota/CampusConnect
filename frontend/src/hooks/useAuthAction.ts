import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UseAuthActionReturn {
  requireAuth: (action: () => void | Promise<void>, message?: string) => void;
  isAuthenticated: boolean;
}

export const useAuthAction = (): UseAuthActionReturn => {
  const { state } = useAuth();
  const navigate = useNavigate();

  const requireAuth = useCallback((
    action: () => void | Promise<void>, 
    message: string = 'Please sign in to continue'
  ) => {
    if (state.isAuthenticated) {
      action();
    } else {
      // Show a toast or alert message (you can customize this)
      if (window.confirm(`${message}. Would you like to sign in now?`)) {
        navigate('/auth');
      }
    }
  }, [state.isAuthenticated, navigate]);

  return {
    requireAuth,
    isAuthenticated: state.isAuthenticated,
  };
};