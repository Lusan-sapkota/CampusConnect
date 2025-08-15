import { useState, useCallback } from 'react';
import { authApi, ApiError, UpdateProfileRequest } from '../api';

interface ProfileState {
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  isUploadingPicture: boolean;
}

interface UseProfileReturn {
  state: ProfileState;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  deleteProfilePicture: () => Promise<boolean>;
  clearError: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [state, setState] = useState<ProfileState>({
    isLoading: false,
    error: null,
    isUpdating: false,
    isUploadingPicture: false,
  });

  const validateProfileData = (data: UpdateProfileRequest): string[] => {
    const errors: string[] = [];
    
    if (data.full_name && data.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }
    
    if (data.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
    
    return errors;
  };

  const validateProfilePicture = (file: File): string[] => {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      errors.push('Profile picture must be less than 5MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Profile picture must be a JPEG, PNG, or WebP image');
    }
    
    return errors;
  };

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    
    // Validate profile data
    const validationErrors = validateProfileData(data);
    if (validationErrors.length > 0) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: validationErrors.join('. '),
      }));
      return false;
    }

    try {
      const response = await authApi.updateProfile(data);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: response.message || 'Failed to update profile',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update profile';
      
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const uploadProfilePicture = useCallback(async (file: File): Promise<boolean> => {
    setState(prev => ({ ...prev, isUploadingPicture: true, error: null }));
    
    // Validate file
    const validationErrors = validateProfilePicture(file);
    if (validationErrors.length > 0) {
      setState(prev => ({
        ...prev,
        isUploadingPicture: false,
        error: validationErrors.join('. '),
      }));
      return false;
    }

    try {
      const response = await authApi.uploadProfilePicture(file);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isUploadingPicture: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isUploadingPicture: false,
          error: response.message || 'Failed to upload profile picture',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to upload profile picture';
      
      setState(prev => ({
        ...prev,
        isUploadingPicture: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const deleteProfilePicture = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isUploadingPicture: true, error: null }));

    try {
      const response = await authApi.deleteProfilePicture();
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isUploadingPicture: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isUploadingPicture: false,
          error: response.message || 'Failed to delete profile picture',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete profile picture';
      
      setState(prev => ({
        ...prev,
        isUploadingPicture: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    clearError,
  };
};