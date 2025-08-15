import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../components/auth/UserProfile';
import { api } from '../api';

export const AuthDemoPage: React.FC = () => {
  const { state } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testApiEndpoints = async () => {
    addTestResult('Testing API endpoints...');
    
    try {
      // Test events endpoint
      const events = await api.events.getAll();
      addTestResult(`✅ Events API: Retrieved ${events.length} events`);
    } catch (error) {
      addTestResult(`❌ Events API: ${error instanceof Error ? error.message : 'Failed'}`);
    }

    try {
      // Test groups endpoint
      const groups = await api.groups.getAll();
      addTestResult(`✅ Groups API: Retrieved ${groups.length} groups`);
    } catch (error) {
      addTestResult(`❌ Groups API: ${error instanceof Error ? error.message : 'Failed'}`);
    }

    try {
      // Test posts endpoint
      const posts = await api.posts.getAll();
      addTestResult(`✅ Posts API: Retrieved ${posts.length} posts`);
    } catch (error) {
      addTestResult(`❌ Posts API: ${error instanceof Error ? error.message : 'Failed'}`);
    }
  };

  const testAuthEndpoints = async () => {
    addTestResult('Testing Auth endpoints...');
    
    try {
      // Test profile endpoint
      const profile = await api.auth.getProfile();
      addTestResult(`✅ Profile API: Retrieved profile for ${profile.data?.email}`);
    } catch (error) {
      addTestResult(`❌ Profile API: ${error instanceof Error ? error.message : 'Failed'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access the demo page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Demo</h1>
          <p className="text-gray-600">
            Test the authentication system and API endpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Profile</h2>
            <UserProfile />
          </div>

          {/* API Testing Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Testing</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4 mb-6">
                <button
                  onClick={testApiEndpoints}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Test Main API Endpoints
                </button>
                <button
                  onClick={testAuthEndpoints}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Test Auth Endpoints
                </button>
                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Clear Results
                </button>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
                <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tests run yet</p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <div key={index} className="text-sm font-mono">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication State Debug */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication State</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(
                {
                  isAuthenticated: state.isAuthenticated,
                  isLoading: state.isLoading,
                  error: state.error,
                  user: state.user ? {
                    user_id: state.user.user_id,
                    email: state.user.email,
                    session_token: state.user.session_token ? '[HIDDEN]' : null
                  } : null
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};