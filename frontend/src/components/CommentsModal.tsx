import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  comments: Comment[];
  onAddComment?: (comment: string) => Promise<void>;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, postTitle, comments, onAddComment }) => {
  const { state } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(newComment);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate mr-4">
            Comments
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            aria-label="Close comments"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 
                        bg-gray-100 dark:bg-gray-700 rounded-xl mb-2">
          <p className="text-sm sm:text-base font-semibold 
                        text-gray-900 dark:text-gray-100 leading-relaxed">
            {postTitle}
          </p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {comments.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">
                No comments yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 group">
                <Avatar
                  src={comment.author.avatar}
                  name={comment.author.name}
                  size="sm"
                  className="flex-shrink-0 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 dark:bg-gray-700/70 rounded-2xl p-3 sm:p-4 transition-colors duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {comment.author.name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex-shrink-0">
                        {comment.author.role}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <button className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <form onSubmit={handleSubmitComment} className="flex space-x-2 sm:space-x-3">
            <Avatar
              src={state.user?.profile_picture}
              name={state.user ? `${state.user.first_name} ${state.user.last_name}` : undefined}
              size="sm"
              className="flex-shrink-0 mt-1"
            />
            <div className="flex-1 flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 resize-none"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
                  aria-label="Send comment"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>
          </form>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
            {newComment.length}/500
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
