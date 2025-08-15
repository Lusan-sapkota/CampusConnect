import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  meeting_time: string;
  location: string;
  contact: string;
  image: string;
}

export const JoinedGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch joined groups from API
    // For now, using mock data
    setTimeout(() => {
      setGroups([
        {
          id: '1',
          name: 'Computer Science Club',
          description: 'A community for CS students to collaborate on projects and share knowledge.',
          category: 'academic',
          members: 45,
          meeting_time: 'Wednesdays 7:00 PM',
          location: 'Engineering Building Room 205',
          contact: 'cs-club@university.edu',
          image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'
        },
        {
          id: '2',
          name: 'Photography Society',
          description: 'Explore the art of photography through workshops and photo walks.',
          category: 'arts',
          members: 32,
          meeting_time: 'Saturdays 2:00 PM',
          location: 'Art Building Studio 3',
          contact: 'photo-society@university.edu',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Groups</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Groups and clubs you're a member of
            </p>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No groups joined yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join groups and clubs to connect with like-minded people!
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Groups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      {group.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {group.members} members
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {group.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {group.meeting_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {group.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {group.contact}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      View Group
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${group.contact}`, '_blank')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Contact
                    </button>
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