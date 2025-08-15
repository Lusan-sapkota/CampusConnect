// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Request Types
export interface JoinEventRequest {
  userName: string;
  userEmail: string;
}

export interface JoinGroupRequest {
  userName: string;
  userEmail: string;
}

export interface LikePostRequest {
  userId: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: 'academic' | 'social' | 'announcement' | 'general';
}

// Authentication Types
export interface SendOTPRequest {
  email: string;
  user_name?: string;
  purpose: 'authentication' | 'password_reset';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: 'authentication' | 'password_reset';
}

export interface LoginRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  major: string;
  yearOfStudy: string;
  userRole: string;
  bio?: string;
  profilePicture?: File | null;
}

export interface SimpleSignupRequest {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  phone?: string;
  year_of_study?: string;
  major?: string;
}

export interface UploadProfilePictureRequest {
  profile_picture: File;
}

export interface AuthUser {
  user_id: string;
  email: string;
  session_token: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  bio?: string;
  phone?: string;
  year_of_study?: string;
  major?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  created_at?: string;
}

export interface AuthResponse extends ApiResponse {
  data?: AuthUser;
}

// Re-export existing types for convenience
export type { Event } from '../data/events';
export type { Group } from '../data/groups';
export type { Post } from '../data/posts';