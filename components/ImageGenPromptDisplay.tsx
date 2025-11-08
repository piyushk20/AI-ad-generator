import React, { useState } from 'react';
import { ImageGenPrompt } from '../types';

interface ImageGenPromptDisplayProps {
  prompts: ImageGenPrompt[];
}

const ImageGenPromptDisplay: React.FC<ImageGenPromptDisplayProps> = ({ prompts }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Final Image Generation Prompts
      </h3>
      <div className="space-y-6">
        {prompts.map((prompt, index) => (
          <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg text-white">{prompt.conceptName}</h4>
                <button
                    onClick={() => handleCopy(prompt.prompt, index)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors duration-200 flex-shrink-0"
                >
                    {copiedIndex === index ? 'Copied!' : 'Copy Prompt'}
                </button>
            </div>
            <pre className="bg-gray-900 p-3 rounded-md text-gray-300 text-xs whitespace-pre-wrap font-mono">
              <code>{prompt.prompt}</code>
            </pre>
            <div className="mt-4 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-300 mb-2 text-center">
                    Final Call to Action
                </h5>
                <div className="bg-blue-900/50 border border-blue-500/50 rounded-lg p-3">
                    <p className="text-base font-semibold text-white text-center">{prompt.cta}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
       <p className="text-center text-xs text-gray-500 mt-2">Use these detailed prompts in an image generation model like 'gemini-2.5-flash-image' (nano banana) to create your final advert image.</p>
    </div>
  );
};

export default ImageGenPromptDisplay;