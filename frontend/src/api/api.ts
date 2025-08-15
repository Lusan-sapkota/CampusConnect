import type { 
  Event, 
  Group, 
  Post, 
  ApiResponse, 
  JoinEventRequest, 
  JoinGroupRequest, 
  LikePostRequest,
  CreatePostRequest,
  SendOTPRequest,
  VerifyOTPRequest,
  LoginRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  AuthResponse
} from './types';

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the default error message
      }
      
      throw new ApiError(errorMessage, response.status, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors or other fetch errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

// Events API
export const eventsApi = {
  /**
   * Get all events
   */
  getAll: async (): Promise<Event[]> => {
    const response = await apiRequest<ApiResponse<Event[]>>('/events');
    return response.data || [];
  },

  /**
   * Get event by ID
   */
  getById: async (id: string): Promise<Event> => {
    const response = await apiRequest<ApiResponse<Event>>(`/events/${id}`);
    if (!response.data) {
      throw new ApiError('Event not found');
    }
    return response.data;
  },

  /**
   * Join an event
   */
  join: async (id: string, userData: JoinEventRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/events/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Groups API
export const groupsApi = {
  /**
   * Get all groups
   */
  getAll: async (): Promise<Group[]> => {
    const response = await apiRequest<ApiResponse<Group[]>>('/groups');
    return response.data || [];
  },

  /**
   * Get group by ID
   */
  getById: async (id: string): Promise<Group> => {
    const response = await apiRequest<ApiResponse<Group>>(`/groups/${id}`);
    if (!response.data) {
      throw new ApiError('Group not found');
    }
    return response.data;
  },

  /**
   * Join a group
   */
  join: async (id: string, userData: JoinGroupRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/groups/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Posts API
export const postsApi = {
  /**
   * Get all posts
   */
  getAll: async (): Promise<Post[]> => {
    const response = await apiRequest<ApiResponse<Post[]>>('/posts');
    return response.data || [];
  },

  /**
   * Create a new post
   */
  create: async (postData: CreatePostRequest): Promise<ApiResponse<Post>> => {
    return apiRequest<ApiResponse<Post>>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  /**
   * Like a post
   */
  like: async (id: string, userData: LikePostRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/posts/${id}/like`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Authentication API
export const authApi = {
  /**
   * Send OTP to email
   */
  sendOTP: async (data: SendOTPRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login with email and OTP
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>('/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout
   */
  logout: async (): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<AuthResponse>('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Main API object for convenience
export const api = {
  events: eventsApi,
  groups: groupsApi,
  posts: postsApi,
  auth: authApi,
};

// Legacy functions for backward compatibility (as specified in requirements)
export const getEvents = eventsApi.getAll;
export const joinEvent = (data: JoinEventRequest & { eventId: string }) => {
  const { eventId, ...userData } = data;
  return eventsApi.join(eventId, userData);
};

export default api;