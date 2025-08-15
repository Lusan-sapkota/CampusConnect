import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authApi, AuthUser, ApiError } from '../api';

// Auth State Types
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_LOADING' };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  login: (email: string, otp: string) => Promise<boolean>;
  completeSignup: (signupData: any, otp?: string) => Promise<{ success: boolean; otp?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CLEAR_LOADING':
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      } else {
        localStorage.removeItem('auth_token');
        dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      if (error instanceof ApiError) {
        dispatch({ type: 'AUTH_ERROR', payload: error.message });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: 'Authentication check failed' });
      }
    }
  };

  const login = async (email: string, otp: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.login({ email, otp });
      
      if (response.success && response.data) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.session_token);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
        return true;
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Login failed' });
        return false;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        dispatch({ type: 'AUTH_ERROR', payload: error.message });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: 'Login failed' });
      }
      return false;
    }
  };

  const completeSignup = async (signupData: any, otp?: string): Promise<{ success: boolean; otp?: string }> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      if (otp) {
        // Verify OTP for complete signup
        const response = await authApi.verifySignup(signupData.email, otp);
        
        if (response.success && response.data) {
          // Store token in localStorage
          localStorage.setItem('auth_token', response.data.session_token);
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
          // Fetch complete profile data after successful verification
          await checkAuthStatus();
          return { success: true };
        } else {
          dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Verification failed' });
          return { success: false };
        }
      } else {
        // Initial signup - just send data
        const response = await authApi.signup(signupData);
        
        if (response.success) {
          // Don't log in yet, wait for OTP verification
          // Clear loading state since signup is complete, now waiting for OTP
          dispatch({ type: 'CLEAR_LOADING' });
          // Return OTP for development (remove in production)
          return { 
            success: true, 
            otp: (response as any).data?.otp_code 
          };
        } else {
          dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Signup failed' });
          return { success: false };
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        dispatch({ type: 'AUTH_ERROR', payload: error.message });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: 'Signup failed' });
      }
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    completeSignup,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};