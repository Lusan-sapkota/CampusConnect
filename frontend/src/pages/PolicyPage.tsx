import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Information Collection</h2>
          <p className="text-gray-700 dark:text-gray-300">We collect information you provide when registering, posting, or interacting with CampusConnect. This may include your name, email, and profile details.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Use of Information</h2>
          <p className="text-gray-700 dark:text-gray-300">Your information is used to provide and improve our services, personalize your experience, and communicate important updates.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Data Protection</h2>
          <p className="text-gray-700 dark:text-gray-300">We implement security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PolicyPage;
