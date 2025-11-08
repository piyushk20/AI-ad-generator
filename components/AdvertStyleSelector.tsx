import React from 'react';
import { AdvertStyle } from '../types';

interface AdvertStyleSelectorProps {
  styles: AdvertStyle[];
  onSelect: (style: AdvertStyle) => void;
  selectedStyle: AdvertStyle | null;
}

const AdvertStyleSelector: React.FC<AdvertStyleSelectorProps> = ({ styles, onSelect, selectedStyle }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">Choose a Trending Ad Style</h3>
        <p className="text-gray-400 mt-1 text-sm">Select a style to guide the AI's creativity. We've suggested 5 based on your product.</p>
      </div>
      <div className="space-y-4">
        {styles.map((style, index) => (
          <button
            key={index}
            onClick={() => onSelect(style)}
            className={`w-full p-4 rounded-lg text-left border-2 transition-all duration-200 
              ${selectedStyle?.title === style.title
                ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500'
                : 'bg-gray-700/50 border-gray-600 hover:border-blue-500/50'
              }`}
          >
            <h4 className="font-bold text-md text-white">{style.title}</h4>
            <p className="text-gray-400 text-sm mt-1">{style.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvertStyleSelector;