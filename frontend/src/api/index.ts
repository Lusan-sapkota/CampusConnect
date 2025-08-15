// Main API exports
export { default as api, eventsApi, groupsApi, postsApi, authApi, getEvents, joinEvent, ApiError } from './api';

// Type exports
export type {
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
  UpdateProfileRequest,
  AuthUser,
  AuthResponse,
  Event,
  Group,
  Post,
} from './types';