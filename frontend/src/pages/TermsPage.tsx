import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">By accessing or using CampusConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">User Responsibilities</h2>
          <p className="text-gray-700 dark:text-gray-300">You agree not to misuse the platform, respect other users, and comply with all local laws. Any violation may result in suspension or termination of your account.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Changes to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
