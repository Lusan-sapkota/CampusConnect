import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Users, Bookmark, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const { state, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = state.user;
  if (!user) return null;

  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                   user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const DropdownItem = ({ 
    to, 
    icon, 
    children, 
    onClick 
  }: { 
    to?: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    const baseClasses = "flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200";
    
    if (to) {
      return (
        <Link
          to={to}
          onClick={() => setIsOpen(false)}
          className={baseClasses}
        >
          {icon}
          <span className="ml-3">{children}</span>
        </Link>
      );
    }

    return (
      <button
        onClick={onClick}
        className={baseClasses}
      >
        {icon}
        <span className="ml-3">{children}</span>
      </button>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <Avatar
          src={user.profile_picture}
          name={userName}
          size="sm"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.user_role || 'student'}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.profile_picture}
                name={userName}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.user_role || 'student'} • {user.major}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-1">
            <DropdownItem to="/profile" icon={<User className="w-4 h-4" />}>
              My Profile
            </DropdownItem>
          </div>

          {/* Events & Groups Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                My Activity
              </p>
            </div>
            
            <DropdownItem to="/profile/joined-events" icon={<Calendar className="w-4 h-4" />}>
              Joined Events
            </DropdownItem>
            
            <DropdownItem to="/profile/saved-events" icon={<Bookmark className="w-4 h-4" />}>
              Saved Events
            </DropdownItem>
            
            <DropdownItem to="/profile/joined-groups" icon={<Users className="w-4 h-4" />}>
              Joined Groups
            </DropdownItem>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <DropdownItem 
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign out
            </DropdownItem>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;