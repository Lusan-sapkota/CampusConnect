import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../data/posts';
import { useAuthRequired } from '../hooks/useAuthRequired';
import AuthRequiredModal from './auth/AuthRequiredModal';
import CommentsModal from './CommentsModal';
import Avatar from './Avatar';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { showAuthModal, authAction, requireAuth, closeAuthModal } = useAuthRequired();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

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

  const handleLike = () => {
    requireAuth('like this post', () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    });
  };

  const handleComment = () => {
    requireAuth('comment on this post', () => {
      setShowComments(true);
    });
  };

  // Mock comments data - in a real app, this would come from your API
  const mockComments = [
    {
      id: '1',
      author: {
        name: 'Sarah Johnson',
        avatar: '/api/placeholder/32/32',
        role: 'Student'
      },
      content: 'This is really helpful! Thanks for sharing.',
      timestamp: '2h ago',
      likes: 3
    },
    {
      id: '2',
      author: {
        name: 'Mike Chen',
        avatar: '/api/placeholder/32/32',
        role: 'Student'
      },
      content: 'I completely agree with this perspective.',
      timestamp: '1h ago',
      likes: 1
    }
  ];

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
        comments={mockComments}
      />
    </div>
  );
};

export default PostCard;