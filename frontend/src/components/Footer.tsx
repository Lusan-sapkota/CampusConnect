import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-4 flex flex-col sm:flex-row items-center justify-between text-sm">
      <div className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</div>
      <div className="text-gray-600 dark:text-gray-400">
        Support: <a href="mailto:support@lusansapkota.online" className="text-primary-500 hover:underline">support@lusansapkota.online</a>
      </div>
    </footer>
  );
};

export default Footer;
