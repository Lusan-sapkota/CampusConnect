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
  SignupRequest,
  SimpleSignupRequest,
  UpdateProfileRequest,
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
  
  // Don't set Content-Type for FormData, let browser handle it
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions: RequestInit = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
   * Create a new event
   */
  create: async (eventData: FormData): Promise<ApiResponse<Event>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Event>>('/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: eventData,
    });
  },

  /**
   * Update an event
   */
  update: async (id: string, eventData: FormData): Promise<ApiResponse<Event>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Event>>(`/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: eventData,
    });
  },

  /**
   * Delete an event
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Join an event
   */
  join: async (id: string, userData: JoinEventRequest): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/events/${id}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },

  /**
   * Leave an event
   */
  leave: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/events/${id}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Save an event
   */
  save: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/events/${id}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Unsave an event
   */
  unsave: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/events/${id}/unsave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
   * Create a new group
   */
  create: async (groupData: FormData): Promise<ApiResponse<Group>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Group>>('/groups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: groupData,
    });
  },

  /**
   * Update a group
   */
  update: async (id: string, groupData: FormData): Promise<ApiResponse<Group>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Group>>(`/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: groupData,
    });
  },

  /**
   * Delete a group
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/groups/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Join a group
   */
  join: async (id: string, userData: JoinGroupRequest): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/groups/${id}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },

  /**
   * Leave a group
   */
  leave: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/groups/${id}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
   * Get post by ID
   */
  getById: async (id: string): Promise<Post> => {
    const response = await apiRequest<ApiResponse<Post>>(`/posts/${id}`);
    if (!response.data) {
      throw new ApiError('Post not found');
    }
    return response.data;
  },

  /**
   * Create a new post
   */
  create: async (postData: CreatePostRequest): Promise<ApiResponse<Post>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Post>>('/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
      body: JSON.stringify(postData),
    });
  },

  /**
   * Update a post
   */
  update: async (id: string, postData: CreatePostRequest): Promise<ApiResponse<Post>> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse<Post>>(`/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
      body: JSON.stringify(postData),
    });
  },

  /**
   * Delete a post
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
    });
  },

  /**
   * Like a post
   */
  like: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/posts/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
    });
  },

  /**
   * Unlike a post
   */
  unlike: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/posts/${id}/unlike`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
    });
  },

  /**
   * Add comment to a post
   */
  addComment: async (id: string, comment: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-ID': 'user-1', // TODO: Get from auth context
      },
      body: JSON.stringify({ comment }),
    });
  },

  /**
   * Get comments for a post
   */
  getComments: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/posts/${id}/comments`);
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
   * Login with email and password
   */
  loginWithPassword: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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

  /**
   * Sign up new user
   */
  signup: async (data: SignupRequest | SimpleSignupRequest): Promise<AuthResponse> => {
    if ('firstName' in data) {
      // Complete signup with profile data
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('first_name', data.firstName);
      formData.append('last_name', data.lastName);
      if (data.phone) formData.append('phone', data.phone);
      formData.append('major', data.major);
      formData.append('year_of_study', data.yearOfStudy);
      formData.append('user_role', data.userRole);
      if (data.bio) formData.append('bio', data.bio);
      if (data.profilePicture) formData.append('profile_picture', data.profilePicture);
      
      return apiRequest<AuthResponse>('/auth/complete-signup', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Simple signup
      return apiRequest<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  /**
   * Verify signup OTP
   */
  verifySignup: async (email: string, otp: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/verify-signup', {
      method: 'POST',
      body: JSON.stringify({ email, otp, purpose: 'signup' }),
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>('/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    return apiRequest<ApiResponse>('/auth/profile/picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  /**
   * Delete profile picture
   */
  deleteProfilePicture: async (): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>('/auth/profile/picture', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Users API
export const usersApi = {
  /**
   * Get user profile by ID
   */
  getById: async (id: string): Promise<any> => {
    const response = await apiRequest<ApiResponse<any>>(`/users/${id}`);
    if (!response.data) {
      throw new ApiError('User not found');
    }
    return response.data;
  },

  /**
   * Follow a user
   */
  follow: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/users/${id}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Unfollow a user
   */
  unfollow: async (id: string): Promise<ApiResponse> => {
    const token = localStorage.getItem('auth_token');
    return apiRequest<ApiResponse>(`/users/${id}/unfollow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Get user's posts
   */
  getPosts: async (id: string): Promise<Post[]> => {
    const response = await apiRequest<ApiResponse<Post[]>>(`/users/${id}/posts`);
    return response.data || [];
  },

  /**
   * Get user's events
   */
  getEvents: async (id: string): Promise<Event[]> => {
    const response = await apiRequest<ApiResponse<Event[]>>(`/users/${id}/events`);
    return response.data || [];
  },

  /**
   * Get user's groups
   */
  getGroups: async (id: string): Promise<Group[]> => {
    const response = await apiRequest<ApiResponse<Group[]>>(`/users/${id}/groups`);
    return response.data || [];
  },
};

// Main API object for convenience
export const api = {
  events: eventsApi,
  groups: groupsApi,
  posts: postsApi,
  auth: authApi,
  users: usersApi,
};

// Legacy functions for backward compatibility (as specified in requirements)
export const getEvents = eventsApi.getAll;
export const joinEvent = (data: JoinEventRequest & { eventId: string }) => {
  const { eventId, ...userData } = data;
  return eventsApi.join(eventId, userData);
};

export default api;