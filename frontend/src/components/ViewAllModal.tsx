import React from 'react';
import Modal from './Modal';
import PostCard from './PostCard';
import EventCard from './EventCard';
import GroupCard from './GroupCard';

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'posts' | 'events' | 'groups';
  title: string;
  data: any[];
}

const ViewAllModal: React.FC<ViewAllModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  data 
}) => {
  const renderContent = () => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No {type} found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.map((item) => {
          switch (type) {
            case 'posts':
              return <PostCard key={item.id} post={item} />;
            case 'events':
              return <EventCard key={item.id} event={item} />;
            case 'groups':
              return <GroupCard key={item.id} group={item} />;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="lg"
    >
      {renderContent()}
    </Modal>
  );
};

export default ViewAllModal;
