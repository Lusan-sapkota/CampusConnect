import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Clock, 
  Mail, 
  ArrowLeft, 
  UserPlus, 
  UserMinus,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  meetingTime: string;
  location: string;
  contact: string;
  image: string;
  isJoined?: boolean;
  canEdit?: boolean;
}

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGroup(id);
    }
  }, [id]);

  const fetchGroup = async (groupId: string) => {
    try {
      setLoading(true);
      const response = await api.groups.getById(groupId);
      setGroup(response);
    } catch (error: any) {
      setError(error.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!group || !state.user) return;
    
    setJoining(true);
    try {
      await api.groups.join(group.id, {
        userName: state.user.full_name || `${state.user.first_name} ${state.user.last_name}`,
        userEmail: state.user.email
      });
      
      setGroup(prev => prev ? {
        ...prev,
        isJoined: true,
        members: prev.members + 1
      } : null);
    } catch (error: any) {
      setError(error.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    setJoining(true);
    try {
      const response = await api.groups.leave(group.id);
      if (response.success) {
        setGroup(prev => prev ? {
          ...prev,
          isJoined: false,
          members: prev.members - 1
        } : null);
      } else {
        setError(response.message || 'Failed to leave group');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to leave group');
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const response = await api.groups.delete(group.id);
      if (response.success) {
        navigate('/groups');
      } else {
        setError(response.message || 'Failed to delete group');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Group not found'}
          </h2>
          <button
            onClick={() => navigate('/groups')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Group Details</h1>
        </div>

        {/* Group Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-64">
            <img
              src={group.image}
              alt={group.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <div className="flex items-center mb-2">
                  <span className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                    {group.category}
                  </span>
                  <div className="flex items-center ml-4 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {group.members} members
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {group.description}
              </p>
            </div>

            {/* Meeting Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meeting Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Meeting Time</p>
                    <p className="text-gray-600 dark:text-gray-400">{group.meetingTime}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">{group.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Contact</p>
                    <a 
                      href={`mailto:${group.contact}`}
                      className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {group.contact}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                {state.isAuthenticated ? (
                  <>
                    {group.isJoined ? (
                      <button
                        onClick={handleLeaveGroup}
                        disabled={joining}
                        className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        {joining ? 'Leaving...' : 'Leave Group'}
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinGroup}
                        disabled={joining}
                        className="w-full flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {joining ? 'Joining...' : 'Join Group'}
                      </button>
                    )}
                    
                    {group.canEdit && (
                      <>
                        <button
                          onClick={() => navigate(`/groups/${group.id}/edit`)}
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Group
                        </button>
                        <button
                          onClick={handleDeleteGroup}
                          className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Group
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Sign In to Join
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Members</span>
                  <span className="font-medium text-gray-900 dark:text-white">{group.members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{group.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};