import React from 'react';
import { Users, MapPin, Clock, Mail } from 'lucide-react';
import { Group } from '../data/groups';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
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
      case 'service':
        return 'bg-pink-500';
      case 'professional':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-40 sm:h-48">
        <img
          src={group.image}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(group.category)}`}>
          {group.category}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {group.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {group.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{group.members} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{group.meetingTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{group.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{group.contact}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Join Group
        </button>
      </div>
    </div>
  );
};

export default GroupCard;