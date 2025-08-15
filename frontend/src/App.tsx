import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { JoinedEventsPage } from './pages/JoinedEventsPage';
import { SavedEventsPage } from './pages/SavedEventsPage';
import { JoinedGroupsPage } from './pages/JoinedGroupsPage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { AddGroupPage } from './pages/AddGroupPage';
import { AddEventPage } from './pages/AddEventPage';
import { AddPostPage } from './pages/AddPostPage';
import { EditPostPage } from './pages/EditPostPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GroupsPage from './pages/GroupsPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import TermsPage from './pages/TermsPage';
import PolicyPage from './pages/PolicyPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import lenisManager from './utils/lenis';

// Main App Content Component
const AppContent: React.FC = () => {
  const { state } = useAuth();

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    lenisManager.init();
    return () => {
      lenisManager.destroy();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<HomePage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/group/:id" element={<GroupDetailsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          {/* Auth routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          {/* Protected routes - require authentication */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/joined-events" 
            element={
              <ProtectedRoute>
                <JoinedEventsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/saved-events" 
            element={
              <ProtectedRoute>
                <SavedEventsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/joined-groups" 
            element={
              <ProtectedRoute>
                <JoinedGroupsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-group" 
            element={
              <ProtectedRoute>
                <AddGroupPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-event" 
            element={
              <ProtectedRoute>
                <AddEventPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-post" 
            element={
              <ProtectedRoute>
                <AddPostPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;