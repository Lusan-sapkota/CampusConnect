import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showFallback?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '', 
  showFallback = true 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const getBackgroundColor = (name?: string): string => {
    if (!name) return 'bg-gray-400';
    
    // Generate a consistent color based on the name
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-medium ${className}`;

  // If we have a valid image source, show the image
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${baseClasses} object-cover`}
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          e.currentTarget.style.display = 'none';
          if (showFallback && e.currentTarget.nextSibling) {
            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }

  // If we have a name, show initials with colored background
  if (name && showFallback) {
    const initials = getInitials(name);
    const bgColor = getBackgroundColor(name);
    
    return (
      <div className={`${baseClasses} ${bgColor} text-white`}>
        {initials}
      </div>
    );
  }

  // Fallback to user icon
  if (showFallback) {
    return (
      <div className={`${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}>
        <User className={`w-${size === 'xs' ? '3' : size === 'sm' ? '4' : size === 'md' ? '5' : size === 'lg' ? '6' : size === 'xl' ? '8' : '10'} h-${size === 'xs' ? '3' : size === 'sm' ? '4' : size === 'md' ? '5' : size === 'lg' ? '6' : size === 'xl' ? '8' : '10'}`} />
      </div>
    );
  }

  return null;
};

export default Avatar;