import React, { useState } from 'react';
import { VideoScript } from '../types';

interface VideoScriptDisplayProps {
  scripts: VideoScript[];
}

const VideoScriptDisplay: React.FC<VideoScriptDisplayProps> = ({ scripts }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const formatScriptForCopy = (script: VideoScript): string => {
    let text = `VIDEO SCRIPT: ${script.conceptName}\n`;
    text += `FINAL CTA: ${script.cta}\n\n`;
    text += "----------------------------------------\n";
    script.shots.forEach(shot => {
        text += `\n[${shot.timestamp}]\n`;
        text += `Camera: ${shot.camera}\n`;
        text += `Audio: ${shot.audio}\n`;
        text += `Narration: ${shot.narration}\n`;
        text += `Graphics: ${shot.graphics}\n`;
    });
    return text;
  };

  const handleCopy = (script: VideoScript, index: number) => {
    navigator.clipboard.writeText(formatScriptForCopy(script));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        Final High-Budget Video Scripts
      </h3>
      <div className="space-y-8">
        {scripts.map((script, index) => (
          <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
             <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-semibold text-lg text-white">{script.conceptName}</h4>
                    <p className="text-xs font-semibold text-gray-400 mt-2">Final CTA: <span className="text-sm text-white font-mono bg-gray-700 p-1 rounded-md">{script.cta}</span></p>
                </div>
                <button
                    onClick={() => handleCopy(script, index)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors duration-200 flex-shrink-0"
                >
                    {copiedIndex === index ? 'Copied!' : 'Copy Script'}
                </button>
            </div>
            
            {/* Script Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full text-sm text-gray-300">
                {/* Header */}
                <div className="grid grid-cols-5 bg-gray-700/50 font-semibold rounded-t-md">
                  <div className="p-2 col-span-1">Timestamp</div>
                  <div className="p-2 col-span-1">Camera & Action</div>
                  <div className="p-2 col-span-1">Audio & Sound</div>
                  <div className="p-2 col-span-1">Narration</div>
                  <div className="p-2 col-span-1">Graphics</div>
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-700">
                {script.shots.map((shot, shotIndex) => (
                  <div key={shotIndex} className="grid grid-cols-5">
                    <div className="p-2 col-span-1 font-mono">{shot.timestamp}</div>
                    <div className="p-2 col-span-1">{shot.camera}</div>
                    <div className="p-2 col-span-1">{shot.audio}</div>
                    <div className="p-2 col-span-1">{shot.narration}</div>
                    <div className="p-2 col-span-1">{shot.graphics}</div>
                  </div>
                ))}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">Use these detailed scripts as a shot-by-shot guide to produce your high-budget video advert.</p>
    </div>
  );
};

export default VideoScriptDisplay;
