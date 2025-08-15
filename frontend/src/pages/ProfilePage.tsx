import React, { useState, useEffect } from 'react';
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
  Camera,
  X,
  Upload,
  Plus,
  FileText,
  Users,
  Trash2,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChangePasswordForm } from '../components/auth/ChangePasswordForm';
import { api } from '../api/api';

type ProfileTab = 'profile' | 'change-password' | 'settings' | 'my-content';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    (searchParams.get('tab') as ProfileTab) || 'profile'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: state.user?.first_name || '',
    last_name: state.user?.last_name || '',
    major: state.user?.major || '',
    year_of_study: state.user?.year_of_study || '',
    bio: state.user?.bio || '',
    role: state.user?.role || '',
  });
  const [editError, setEditError] = useState('');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentTab, setContentTab] = useState<'posts' | 'events' | 'groups'>('posts');

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setEditError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call your update profile API
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  useEffect(() => {
    if (activeTab === 'my-content') {
      loadUserContent();
    }
  }, [activeTab]);

  const loadUserContent = async () => {
    if (!state.user?.id) return;
    
    setContentLoading(true);
    try {
      // Load user's posts, events, and groups
      const [postsResponse, eventsResponse, groupsResponse] = await Promise.allSettled([
        api.users.getPosts(state.user.id),
        api.users.getEvents(state.user.id),
        api.users.getGroups(state.user.id)
      ]);

      if (postsResponse.status === 'fulfilled') {
        setUserPosts(postsResponse.value);
      }
      if (eventsResponse.status === 'fulfilled') {
        setUserEvents(eventsResponse.value);
      }
      if (groupsResponse.status === 'fulfilled') {
        setUserGroups(groupsResponse.value);
      }
    } catch (error) {
      console.error('Failed to load user content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await api.posts.delete(postId);
      if (response.success) {
        setUserPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await api.events.delete(eventId);
      if (response.success) {
        setUserEvents(prev => prev.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const response = await api.groups.delete(groupId);
      if (response.success) {
        setUserGroups(prev => prev.filter(group => group.id !== groupId));
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
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
      
      case 'my-content':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">My Content</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/add-post')}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </button>
                <button
                  onClick={() => navigate('/add-event')}
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </button>
                <button
                  onClick={() => navigate('/add-group')}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Group
                </button>
              </div>
            </div>

            {/* Content Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6 overflow-x-auto">
              <button
                onClick={() => setContentTab('posts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  contentTab === 'posts'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setContentTab('events')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  contentTab === 'events'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Events ({userEvents.length})
              </button>
              <button
                onClick={() => setContentTab('groups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  contentTab === 'groups'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Groups ({userGroups.length})
              </button>
            </div>

            {/* Content Display */}
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {contentTab === 'posts' && (
                  <>
                    {userPosts.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Share your thoughts with the community</p>
                        <button
                          onClick={() => navigate('/add-post')}
                          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </button>
                      </div>
                    ) : (
                      userPosts.map((post) => (
                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{post.category} • {post.createdAt}</p>
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/post/${post.id}`)}
                                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title="View post"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/post/${post.id}/edit`)}
                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit post"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likesCount || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.commentsCount || 0}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {contentTab === 'events' && (
                  <>
                    {userEvents.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events yet</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Organize events for your community</p>
                        <button
                          onClick={() => navigate('/add-event')}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Event
                        </button>
                      </div>
                    ) : (
                      userEvents.map((event) => (
                        <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{event.date} • {event.location}</p>
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{event.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/event/${event.id}`)}
                                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title="View event"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/event/${event.id}/edit`)}
                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit event"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{event.attendees || 0} attendees</span>
                            <span>•</span>
                            <span className="capitalize">{event.category}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {contentTab === 'groups' && (
                  <>
                    {userGroups.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups yet</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start a group for your interests</p>
                        <button
                          onClick={() => navigate('/add-group')}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Group
                        </button>
                      </div>
                    ) : (
                      userGroups.map((group) => (
                        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{group.name}</h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{group.meetingTime} • {group.location}</p>
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{group.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/group/${group.id}`)}
                                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title="View group"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/group/${group.id}/edit`)}
                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit group"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete group"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{group.members || 0} members</span>
                            <span>•</span>
                            <span className="capitalize">{group.category}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center overflow-hidden">
                    {state.user?.profile_picture ? (
                      <img
                        src={state.user.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl sm:text-4xl font-bold text-primary-600 dark:text-primary-300">
                        {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {state.user?.full_name || `${state.user?.first_name} ${state.user?.last_name}`}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-4">
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                      {state.user?.major}
                    </p>
                    {state.user?.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        {state.user.role}
                      </span>
                    )}
                  </div>
                  {state.user?.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm sm:text-base leading-relaxed">
                      {state.user.bio}
                    </p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="overflow-y-auto max-h-[calc(95vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {/* Profile Picture Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center overflow-hidden">
                            {state.user?.profile_picture ? (
                              <img
                                src={state.user.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-300">
                                {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="absolute -bottom-1 -right-1 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all duration-200 shadow-lg"
                          >
                            <Upload className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                          Click to change profile picture
                        </p>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name *
                          </label>
                          <input 
                            type="text" 
                            value={editForm.first_name} 
                            onChange={e => handleEditChange('first_name', e.target.value)} 
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name *
                          </label>
                          <input 
                            type="text" 
                            value={editForm.last_name} 
                            onChange={e => handleEditChange('last_name', e.target.value)} 
                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input 
                          type="email" 
                          value={state.user?.email || ''} 
                          disabled 
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input 
                          type="text" 
                          value={state.user?.phone || ''} 
                          disabled 
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Phone cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Role *
                        </label>
                        <select 
                          value={editForm.role} 
                          onChange={e => handleEditChange('role', e.target.value)} 
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          required
                        >
                          <option value="">Select role</option>
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="management">Management</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Major
                        </label>
                        <input 
                          type="text" 
                          value={editForm.major} 
                          onChange={e => handleEditChange('major', e.target.value)} 
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="e.g. Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Year of Study
                        </label>
                        <select 
                          value={editForm.year_of_study} 
                          onChange={e => handleEditChange('year_of_study', e.target.value)} 
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        >
                          <option value="">Select year</option>
                          <option value="freshman">Freshman</option>
                          <option value="sophomore">Sophomore</option>
                          <option value="junior">Junior</option>
                          <option value="senior">Senior</option>
                          <option value="graduate">Graduate</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea 
                          value={editForm.bio} 
                          onChange={e => handleEditChange('bio', e.target.value)} 
                          rows={3} 
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                          placeholder="Tell us about yourself..."
                          maxLength={250}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Optional
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {editForm.bio.length}/250
                          </p>
                        </div>
                      </div>

                      {editError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                          <p className="text-red-600 dark:text-red-400 text-sm">{editError}</p>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        onClick={handleEditSubmit}
                        className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">{state.user?.email}</p>
                    </div>
                  </div>
                  {state.user?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{state.user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Academic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Major</p>
                      <p className="font-medium text-gray-900 dark:text-white">{state.user?.major || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Year of Study</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{state.user?.year_of_study || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Activity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <button
                  onClick={() => navigate('/joined-events')}
                  className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 text-left group hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Calendar className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">5</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Joined Events</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events you're attending</p>
                </button>

                <button
                  onClick={() => navigate('/saved-events')}
                  className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 text-left group hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <MapPin className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">3</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Saved Events</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events you bookmarked</p>
                </button>

                <button
                  onClick={() => navigate('/joined-groups')}
                  className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 text-left group hover:shadow-lg sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <User className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">2</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Joined Groups</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('my-content')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'my-content'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              My Content
            </button>
            <button
              onClick={() => setActiveTab('change-password')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
