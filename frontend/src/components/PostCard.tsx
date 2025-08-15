import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../data/posts';
import { useAuthRequired } from '../hooks/useAuthRequired';
import { useAuth } from '../contexts/AuthContext';
import AuthRequiredModal from './auth/AuthRequiredModal';
import CommentsModal from './CommentsModal';
import Avatar from './Avatar';
import { api } from '../api/api';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { showAuthModal, authAction, requireAuth, closeAuthModal } = useAuthRequired();
  const { state } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState<any[]>([]);
  const [isLiking, setIsLiking] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'social':
        return 'bg-emerald-100 text-emerald-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Load comments when component mounts
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    try {
      const response = await api.posts.getComments(post.id);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    }
  };

  const handleLike = () => {
    requireAuth('like this post', async () => {
      if (isLiking) return;
      
      setIsLiking(true);
      try {
        if (isLiked) {
          const response = await api.posts.unlike(post.id);
          if (response.success) {
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
          }
        } else {
          const response = await api.posts.like(post.id);
          if (response.success) {
            setIsLiked(true);
            setLikeCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Failed to toggle like:', error);
        // Optimistic update fallback
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      } finally {
        setIsLiking(false);
      }
    });
  };

  const handleComment = () => {
    requireAuth('comment on this post', () => {
      setShowComments(true);
    });
  };

  const handleAddComment = async (commentText: string) => {
    try {
      const response = await api.posts.addComment(post.id, commentText);
      if (response.success) {
        // Reload comments to get the new one
        await loadComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <Avatar
          src={post.author.avatar}
          name={post.author.name}
          size="lg"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-2 text-xs sm:text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  {post.author.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {post.author.role}
                </span>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {post.timestamp}
                </span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
            {post.description}
          </p>
          
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 ${
                isLiked 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button 
              onClick={handleComment}
              className="flex items-center space-x-1 sm:space-x-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        action={authAction}
      />

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postTitle={post.title}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default PostCard;