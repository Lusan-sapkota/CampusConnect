import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const notifications = [
  { id: 1, title: 'New comment on your post', time: '2m ago' },
  { id: 2, title: 'New follower', time: '10m ago' },
  { id: 3, title: 'Server downtime resolved', time: '1h ago' },
  { id: 4, title: 'Your subscription is expiring', time: '1d ago' },
  { id: 5, title: 'Weekly report is ready', time: '2d ago' },
];

const Notification: React.FC = () => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset viewAll when modal closes
  useEffect(() => {
    if (!open) setViewAll(false);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg transition-colors duration-200 
        ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
        aria-label="Show notifications"
      >
        <Bell className="w-5 h-5" />
      </button>

      {/* Notification Modal */}
      {open && (
        <div
          ref={modalRef} // <-- attach the ref here
          className={`fixed top-16 right-4 md:right-[calc(50%-640px+1rem)] w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50
          ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-900 text-gray-200'}
          transform transition-all duration-1000 ease-out
          ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 space-y-2 transition-all duration-1000 ease-in-out overflow-hidden">
            {(viewAll ? notifications : notifications.slice(0, 2)).map((notif) => (
              <div
                key={notif.id}
                className={`p-2 rounded-lg border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
              </div>
            ))}
          </div>

          {!viewAll && notifications.length > 2 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => setViewAll(true)}
                className="text-blue-500 hover:underline text-sm"
              >
                View All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
