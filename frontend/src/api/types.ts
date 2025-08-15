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
  description: string;
  category: 'academic' | 'social' | 'announcement' | 'general';
  authorName: string;
  authorRole: string;
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

export interface AuthUser {
  user_id: string;
  email: string;
  session_token: string;
}

export interface AuthResponse extends ApiResponse {
  data?: AuthUser;
}

// Re-export existing types for convenience
export type { Event } from '../data/events';
export type { Group } from '../data/groups';
export type { Post } from '../data/posts';