import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Edit3, 
  Lock, 
  LogOut,
  Settings,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChangePasswordForm } from '../components/auth/ChangePasswordForm';

type ProfileTab = 'profile' | 'change-password' | 'settings';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'change-password':
        return (
          <ChangePasswordForm
            onSuccess={() => setActiveTab('profile')}
            onCancel={() => setActiveTab('profile')}
          />
        );
      
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h3>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h4>
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveTab('change-password')}
                    className="flex items-center w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">Sign Out</p>
                      <p className="text-sm opacity-75">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {state.user?.profile_picture ? (
                      <img
                        src={state.user.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                        {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {state.user?.full_name || `${state.user?.first_name} ${state.user?.last_name}`}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {state.user?.user_role} • {state.user?.major}
                  </p>
                  {state.user?.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {state.user.bio}
                    </p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{state.user?.email}</p>
                    </div>
                  </div>
                  
                  {state.user?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{state.user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Academic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Major</p>
                      <p className="font-medium text-gray-900 dark:text-white">{state.user?.major}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Year of Study</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{state.user?.year_of_study}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{state.user?.user_role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => navigate('/joined-events')}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-6 h-6 text-primary-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">5</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Joined Events</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events you're attending</p>
                </button>

                <button
                  onClick={() => navigate('/saved-events')}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-6 h-6 text-primary-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">3</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Saved Events</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events you bookmarked</p>
                </button>

                <button
                  onClick={() => navigate('/joined-groups')}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-6 h-6 text-primary-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">2</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Joined Groups</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Groups you're member of</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('change-password')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'change-password'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 mr-2 inline" />
              Password
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};