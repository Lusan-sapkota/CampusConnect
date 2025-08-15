import React from 'react';
import Modal from './Modal';
import { Users, MapPin, Clock, Mail } from 'lucide-react';
import { Group } from '../data/groups';

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ isOpen, onClose, group }) => {
  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={group.name} size="lg">
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <img
          src={group.image}
          alt={group.name}
          className="w-40 h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{group.members} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{group.meetingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{group.location}</span>
            </div>
            <div className="flex items-center gap-2">
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
        </div>
      </div>
    </Modal>
  );
};

export default GroupDetailsModal;
