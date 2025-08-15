import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { authApi, ApiError } from '../../api';
import { ProfilePicture } from './ProfilePicture';
import { Edit2, Save, X, User, Mail, Phone, GraduationCap, BookOpen } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { state, logout, checkAuthStatus } = useAuth();
  const { state: profileState, updateProfile } = useProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    full_name: state.user?.full_name || '',
    bio: state.user?.bio || '',
    phone: state.user?.phone || '',
    year_of_study: state.user?.year_of_study || '',
    major: state.user?.major || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmNewPassword,
      });

      if (response.success) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordError(error.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile(profileForm);
    
    if (success) {
      setIsEditingProfile(false);
      // Refresh user profile to get updated data
      await checkAuthStatus();
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      full_name: state.user?.full_name || '',
      bio: state.user?.bio || '',
      phone: state.user?.phone || '',
      year_of_study: state.user?.year_of_study || '',
      major: state.user?.major || '',
    });
    setIsEditingProfile(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <ProfilePicture size="xl" editable={true} />
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {state.user.full_name || 'No name set'}
                </p>
                <p className="text-sm text-gray-500">
                  {state.user.major && state.user.year_of_study 
                    ? `${state.user.major} • ${state.user.year_of_study}`
                    : 'Student'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <p className="text-gray-900">{state.user.email}</p>
            </div>
            
            {state.user.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">{state.user.phone}</p>
              </div>
            )}
            
            {state.user.bio && (
              <div className="mt-4">
                <p className="text-gray-700">{state.user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {profileState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{profileState.error}</p>
          </div>
        )}

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={profileState.isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={profileState.isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                  Major
                </label>
                <input
                  id="major"
                  type="text"
                  value={profileForm.major}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, major: e.target.value }))}
                  disabled={profileState.isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label htmlFor="year_of_study" className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <select
                  id="year_of_study"
                  value={profileForm.year_of_study}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, year_of_study: e.target.value }))}
                  disabled={profileState.isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                disabled={profileState.isUpdating}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {profileForm.bio.length}/500 characters
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={profileState.isUpdating}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                <span>{profileState.isUpdating ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelProfileEdit}
                disabled={profileState.isUpdating}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-gray-900">{state.user.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{state.user.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{state.user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <p className="mt-1 text-gray-900">{state.user.major || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                <p className="mt-1 text-gray-900">{state.user.year_of_study || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-gray-500 font-mono text-sm">{state.user.user_id}</p>
              </div>
            </div>
            {state.user.bio && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <p className="mt-1 text-gray-900">{state.user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Change Password
            </button>
          )}
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{passwordSuccess}</p>
          </div>
        )}

        {isChangingPassword && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{passwordError}</p>
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={isLoading}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                disabled={isLoading}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {passwordForm.newPassword && passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                  });
                  setPasswordError(null);
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !passwordForm.currentPassword || 
                  !passwordForm.newPassword || 
                  !passwordForm.confirmNewPassword ||
                  passwordForm.newPassword !== passwordForm.confirmNewPassword
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};