import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  className?: string;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  size = 'md',
  editable = false,
  className = '',
}) => {
  const { state: authState, checkAuthStatus } = useAuth();
  const { state: profileState, uploadProfilePicture, deleteProfilePicture, clearError } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const user = authState.user;
  const profilePictureUrl = user?.profile_picture_url;

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const success = await uploadProfilePicture(file);
    if (success) {
      // Refresh user profile to get updated picture URL
      await checkAuthStatus();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeletePicture = async () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      const success = await deleteProfilePicture();
      if (success) {
        // Refresh user profile to remove picture URL
        await checkAuthStatus();
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getUserInitials = (email: string, fullName?: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const renderProfileImage = () => {
    if (profilePictureUrl) {
      return (
        <img
          src={profilePictureUrl}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        />
      );
    }

    // Fallback to initials or user icon
    const initials = user ? getUserInitials(user.email, user.full_name) : '';
    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${className}`}>
        {initials || <User className={iconSizes[size]} />}
      </div>
    );
  };

  if (!editable) {
    return renderProfileImage();
  }

  return (
    <div className="relative inline-block">
      <div
        className={`relative ${dragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''} rounded-full`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {renderProfileImage()}
        
        {/* Loading overlay */}
        {profileState.isUploadingPicture && (
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black bg-opacity-50 flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Edit overlay */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center group cursor-pointer">
          <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-2 -right-2 flex space-x-1">
        <button
          onClick={handleUploadClick}
          disabled={profileState.isUploadingPicture}
          className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Upload new picture"
        >
          <Upload className="w-3 h-3" />
        </button>
        
        {profilePictureUrl && (
          <button
            onClick={handleDeletePicture}
            disabled={profileState.isUploadingPicture}
            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Delete picture"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error message */}
      {profileState.error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md shadow-lg z-10 min-w-max">
          <p className="text-red-600 text-xs">{profileState.error}</p>
          <button
            onClick={clearError}
            className="text-red-600 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};