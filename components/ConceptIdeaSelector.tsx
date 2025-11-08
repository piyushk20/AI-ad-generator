import React, { useState } from 'react';
import { ConceptIdea } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ConceptIdeaSelectorProps {
  ideas: ConceptIdea[];
  onConfirm: (selectedIdeas: ConceptIdea[]) => void;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const ConceptIdeaSelector: React.FC<ConceptIdeaSelectorProps> = ({ 
    ideas, 
    onConfirm, 
    isLoading, 
    title = "Choose Your Favorite Concepts", 
    subtitle = "Select your two favorite high-level concepts to develop into full photoshoot plans." 
}) => {
  const [selected, setSelected] = useState<ConceptIdea[]>([]);

  const handleSelect = (idea: ConceptIdea) => {
    if (isLoading) return;

    setSelected(prev => {
      const isSelected = prev.some(i => i.title === idea.title);
      if (isSelected) {
        return prev.filter(i => i.title !== idea.title);
      } else {
        if (prev.length < 2) {
          return [...prev, idea];
        }
      }
      return prev;
    });
  };

  const isIdeaSelected = (idea: ConceptIdea) => {
    return selected.some(i => i.title === idea.title);
  };

  const canConfirm = selected.length === 2;

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {title}
        </h2>
        <p className="text-gray-400 mt-2">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ideas.map((idea, index) => (
          <div
            key={index}
            onClick={() => handleSelect(idea)}
            className={`p-6 rounded-lg cursor-pointer border-2 transition-all duration-200 
              ${isIdeaSelected(idea)
                ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500'
                : 'bg-gray-700/50 border-gray-600 hover:border-blue-500/50'
              }`}
          >
            <h3 className="font-bold text-lg text-white">{idea.title}</h3>
            <p className="text-gray-400 text-sm mt-2">{idea.summary}</p>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => onConfirm(selected)}
        disabled={!canConfirm || isLoading}
        className="w-full flex justify-center items-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? <LoadingSpinner text="Generating Details..." /> : 'Confirm & Generate 2 Full Concepts'}
      </button>
    </div>
  );
};

export default ConceptIdeaSelector;