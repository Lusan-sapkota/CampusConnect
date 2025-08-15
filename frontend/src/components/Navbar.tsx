import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogIn, UserPlus, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { state, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation items as modular components
  const NavItem = ({ 
    to, 
    icon, 
    children,
    mobile = false
  }: { 
    to: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    mobile?: boolean;
  }) => (
    <Link
      to={to}
      onClick={closeMobileMenu}
      className={`${mobile ? 'flex items-center px-3 py-2 rounded-lg text-base font-medium' : 'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'} transition-colors duration-200 ${
        isActive(to)
          ? 'border-primary-500 text-gray-900 dark:text-white'
          : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {icon}
      <span className={mobile ? 'ml-3' : 'mr-2'}>{children}</span>
    </Link>
  );

  const AuthButtons = () => (
    <div className="flex items-center space-x-4">
      <Link
        to="/auth"
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
      >
        <LogIn className="w-4 h-4 mr-1" />
        Sign in
      </Link>
      <Link
        to="/auth"
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Sign up
      </Link>
    </div>
  );

  const UserMenu = () => {
    const user = state.user;
    if (!user) return null;
    
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                     user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <Avatar
            src={user.profile_picture}
            name={userName}
            size="sm"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">{userName}</span>
        </button>
        
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">CampusConnect</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavItem to="/" icon={<Home className="w-4 h-4" />}>
              Home
            </NavItem>
            <NavItem to="/groups" icon={<Users className="w-4 h-4" />}>
              Groups
            </NavItem>
            <NavItem to="/events" icon={<Calendar className="w-4 h-4" />}>
              Events
            </NavItem>
            {state.user && (
              <NavItem to="/profile" icon={<User className="w-4 h-4" />}>
                Profile
              </NavItem>
            )}
            
            <div className="mx-2">
              <ThemeToggle />
            </div>
            
            {/* Authentication Section */}
            {state.user ? <UserMenu /> : <AuthButtons />}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavItem to="/" icon={<Home className="w-5 h-5" />} mobile>
                Home
              </NavItem>
              <NavItem to="/groups" icon={<Users className="w-5 h-5" />} mobile>
                Groups
              </NavItem>
              <NavItem to="/events" icon={<Calendar className="w-5 h-5" />} mobile>
                Events
              </NavItem>
              {state.user && (
                <NavItem to="/profile" icon={<User className="w-5 h-5" />} mobile>
                  Profile
                </NavItem>
              )}
              
              {/* Mobile Authentication Section */}
              {state.user ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex items-center px-3 py-2 mb-2">
                    <Avatar
                      src={state.user.profile_picture}
                      name={`${state.user.first_name || ''} ${state.user.last_name || ''}`.trim() || 
                            state.user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      size="sm"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {`${state.user.first_name || ''} ${state.user.last_name || ''}`.trim() || 
                         state.user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{state.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-1">
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;