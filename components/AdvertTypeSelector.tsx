import React from 'react';

interface AdvertTypeSelectorProps {
  onSelect: (type: 'still' | 'video') => void;
}

const AdvertTypeSelector: React.FC<AdvertTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">Choose Your Ad Format</h3>
        <p className="text-gray-400 mt-1 text-sm">Do you want to create a still image or a short video?</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => onSelect('still')}
          className="flex-1 bg-gray-700 border-2 border-gray-600 text-gray-200 font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-900/50 hover:border-blue-500 transition-all duration-300 text-left"
        >
          <div className="text-lg">📸 Still Image</div>
          <div className="text-sm font-normal text-gray-400 mt-1">Generate a professional, high-resolution product advert.</div>
        </button>
        <button
          onClick={() => onSelect('video')}
          className="flex-1 bg-gray-700 border-2 border-gray-600 text-gray-200 font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-purple-900/50 hover:border-purple-500 transition-all duration-300 text-left"
        >
            <div className="text-lg">🎬 Short Video</div>
            <div className="text-sm font-normal text-gray-400 mt-1">Create a concept and script for an 8-10 second video advert.</div>
        </button>
      </div>
    </div>
  );
};

export default AdvertTypeSelector;
