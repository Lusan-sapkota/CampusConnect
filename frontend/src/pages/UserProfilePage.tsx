import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Mail, 
  User, 
  GraduationCap,
  Users,
  MessageCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import Avatar from '../components/Avatar';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  major: string;
  yearOfStudy: string;
  userRole: string;
  bio?: string;
  profilePicture?: string;
  joinedDate: string;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  eventsCount: number;
  groupsCount: number;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  useEffect(() => {
    if (id) {
      fetchUserProfile(id);
    }
  }, [id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch user profile and posts in parallel
      const [profileResponse, postsResponse] = await Promise.all([
        api.users.getById(userId),
        api.users.getPosts(userId)
      ]);
      
      setUserProfile(profileResponse);
      setUserPosts(postsResponse);
    } catch (error: any) {
      setError(error.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userProfile || !state.user) return;
    
    setFollowing(true);
    try {
      const response = userProfile.isFollowing 
        ? await api.users.unfollow(userProfile.id)
        : await api.users.follow(userProfile.id);
      
      if (response.success) {
        setUserProfile(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      } else {
        setError(response.message || 'Failed to update follow status');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update follow status');
    } finally {
      setFollowing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPostDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'User not found'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = state.user?.id === userProfile.id;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar
              src={userProfile.profilePicture}
              alt={userProfile.fullName}
              size="xl"
              className="mx-auto sm:mx-0"
            />
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userProfile.fullName}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  {userProfile.major}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {userProfile.yearOfStudy}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {formatDate(userProfile.joinedDate)}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex justify-center sm:justify-start space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{userProfile.postsCount}</div>
                  <div className="text-gray-600 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{userProfile.followersCount}</div>
                  <div className="text-gray-600 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{userProfile.followingCount}</div>
                  <div className="text-gray-600 dark:text-gray-400">Following</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                {state.isAuthenticated ? (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={following}
                      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        userProfile.isFollowing
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'bg-primary-500 hover:bg-primary-600 text-white'
                      }`}
                    >
                      {following ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : userProfile.isFollowing ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {following ? 'Updating...' : userProfile.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Sign In to Follow
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Posts ({userProfile.postsCount})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' ? (
              <div className="space-y-6">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {post.category}
                            </span>
                            <span>{formatPostDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>{post.likesCount} likes</span>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <User className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOwnProfile ? "You haven't" : `${userProfile.firstName} hasn't`} shared any posts yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bio */}
                {userProfile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">{userProfile.email}</span>
                    </div>
                    {userProfile.phone && (
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">{userProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Major</span>
                      <p className="text-gray-900 dark:text-white">{userProfile.major}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Study</span>
                      <p className="text-gray-900 dark:text-white">{userProfile.yearOfStudy}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</span>
                      <p className="text-gray-900 dark:text-white capitalize">{userProfile.userRole}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(userProfile.joinedDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary-500 mb-1">{userProfile.eventsCount}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Events Joined</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary-500 mb-1">{userProfile.groupsCount}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Groups Joined</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary-500 mb-1">{userProfile.postsCount}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Posts Created</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};