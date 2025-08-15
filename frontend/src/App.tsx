import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GroupsPage from './pages/GroupsPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import lenisManager from './utils/lenis';

function App() {
  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    lenisManager.init();
    return () => {
      lenisManager.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/event/:id" element={<EventDetailsPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;