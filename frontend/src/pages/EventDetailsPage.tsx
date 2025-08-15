import React, { useState } from 'react';
import lenisManager from '../utils/lenis';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Heart } from 'lucide-react';
import { events } from '../data/events';
import { useAuthRequired } from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/auth/AuthRequiredModal';

const EventDetailsPage: React.FC = () => {
  React.useEffect(() => {
    lenisManager.getInstance()?.scrollTo(0);
  }, []);
  const { id } = useParams<{ id: string }>();
  const event = events.find((e) => e.id === id);
  const { showAuthModal, authAction, requireAuth, closeAuthModal } = useAuthRequired();
  const [isJoined, setIsJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The event you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-primary-500';
      case 'social':
        return 'bg-emerald-500';
      case 'sports':
        return 'bg-orange-500';
      case 'arts':
        return 'bg-purple-500';
      case 'career':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleJoinEvent = () => {
    requireAuth('join this event', () => {
      setIsJoined(!isJoined);
      console.log(isJoined ? 'Left event:' : 'Joined event:', event?.title);
    });
  };

  const handleSaveEvent = () => {
    requireAuth('save this event', () => {
      setIsSaved(!isSaved);
      console.log(isSaved ? 'Unsaved event:' : 'Saved event:', event?.title);
    });
  };

  const handleShareEvent = () => {
    // Share functionality doesn't require auth
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
      console.log('Event link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium mb-4 sm:mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Hero Image */}
        <div className="relative h-48 sm:h-64 lg:h-96 rounded-2xl overflow-hidden mb-6 sm:mb-8">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(event.category)} mb-4`}>
              {event.category}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90">
              Organized by {event.organizer}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
                {event.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Attendees Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Who's Going ({event.attendees})
              </h3>
              <div className="flex -space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-emerald-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium text-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                {event.attendees > 5 && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-medium text-sm">
                    +{event.attendees - 5}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {event.maxAttendees - event.attendees} spots remaining
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Event Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Date</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Attendance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {event.attendees} / {event.maxAttendees} people
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleJoinEvent}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                  isJoined
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {isJoined ? 'Leave Event' : 'Join Event'}
              </button>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleSaveEvent}
                  className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base ${
                    isSaved
                      ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button 
                  onClick={handleShareEvent}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Organizer</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {event.organizer.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{event.organizer}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Required Modal */}
        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          action={authAction}
        />
      </div>
    </div>
  );
};

export default EventDetailsPage;