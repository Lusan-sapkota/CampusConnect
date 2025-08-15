import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  max_attendees: number;
  image: string;
}

export const JoinedEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch joined events from API
    // For now, using mock data
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          title: 'Tech Career Fair 2024',
          description: 'Connect with top tech companies and explore career opportunities.',
          date: '2024-03-15',
          time: '10:00 AM - 4:00 PM',
          location: 'Student Union Building',
          category: 'career',
          attendees: 150,
          max_attendees: 200,
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
        },
        {
          id: '2',
          title: 'Spring Music Festival',
          description: 'Join us for an evening of live music featuring local bands.',
          date: '2024-03-20',
          time: '6:00 PM - 10:00 PM',
          location: 'Campus Amphitheater',
          category: 'arts',
          attendees: 280,
          max_attendees: 300,
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Events you've joined and are attending
            </p>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events joined yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring and join events that interest you!
            </p>
            <button
              onClick={() => navigate('/events')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      {event.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {event.attendees}/{event.max_attendees}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};