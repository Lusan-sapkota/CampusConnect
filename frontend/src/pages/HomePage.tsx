import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import ViewAllModal from '../components/ViewAllModal';
import { posts } from '../data/posts';
import { events } from '../data/events';
import lenisManager from '../utils/lenis';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  React.useEffect(() => {
    lenisManager.getInstance()?.scrollTo(0);
  }, []);
  const upcomingEvents = events.slice(0, 3);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'posts' | 'events' | null;
    title: string;
    data: any[];
  }>({
    isOpen: false,
    type: null,
    title: '',
    data: []
  });

  const openModal = (type: 'posts' | 'events', title: string, data: any[]) => {
    setModalState({
      isOpen: true,
      type,
      title,
      data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      title: '',
      data: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Welcome to CampusConnect</h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90">
              Stay connected with your campus community. Discover events, join groups, and engage with fellow students.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Campus Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Campus Feed</h2>
                <button 
                  onClick={() => openModal('posts', 'All Campus Posts', posts)}
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm sm:text-base transition-colors duration-200"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
            {/* Upcoming Events Sidebar */}
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                <button 
                  onClick={() => openModal('events', 'All Events', events)}
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm sm:text-base transition-colors duration-200"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
              {/* Quick Stats */}
              <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campus Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Active Students</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Student Groups</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">124</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">This Week's Events</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* View All Modal */}
        {modalState.type && (
          <ViewAllModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            type={modalState.type}
            title={modalState.title}
            data={modalState.data}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;