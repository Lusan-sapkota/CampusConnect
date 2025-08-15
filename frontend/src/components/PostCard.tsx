import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../data/posts';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
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
            <button className="flex items-center space-x-1 sm:space-x-2 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200">
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 sm:space-x-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;