
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm py-4 border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI</span> Ad Concept Generator
        </h1>
        <p className="text-gray-400 text-sm mt-1">Professional Product Shoots, Instantly.</p>
      </div>
    </header>
  );
};

export default Header;
