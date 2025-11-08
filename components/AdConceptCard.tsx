import React, { useState } from 'react';
import { AdConcept } from '../types';

interface AdConceptCardProps {
  concept: AdConcept;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-6 focus:outline-none"
            >
                <h4 className="text-md font-semibold text-gray-200">{title}</h4>
                <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && <div className="px-6 pb-4 text-gray-300 text-sm space-y-3">{children}</div>}
        </div>
    );
};

const AdConceptCard: React.FC<AdConceptCardProps> = ({ concept }) => {
  const isVideo = concept.format === 'Short Video';

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-purple-500/50">
      <div className="p-6 bg-gray-800/50">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {concept.optionName}
                </h3>
                <p className="text-gray-400 mt-2 text-sm">{concept.conceptSummary}</p>
            </div>
            <span className={`text-xs font-bold py-1 px-3 rounded-full ${isVideo ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {concept.format}
            </span>
        </div>
      </div>

      <div className="bg-gray-800">
        <DetailSection title={isVideo ? "🎬 Scene & Styling Details" : "📸 Photo Shoot Details"} defaultOpen={true}>
          <p><strong>{isVideo ? 'Scene Description' : 'Setup'}:</strong> {concept.shootSetup}</p>
          <p><strong>Styling Notes:</strong> {concept.stylingNotes}</p>
          <p><strong>Post-Production:</strong> {concept.postProduction}</p>
        </DetailSection>

        <DetailSection title="⚙️ Technical Specs">
            <p><strong>Mood/Effect:</strong> {concept.technicalSpecs.mood}</p>
            <p><strong>Camera:</strong> {concept.technicalSpecs.camera}</p>
            <p><strong>{isVideo ? 'Lens Style' : 'Lenses'}:</strong> {concept.technicalSpecs.lenses}</p>
            <p><strong>{isVideo ? 'Key Shots' : 'Angles'}:</strong> {concept.technicalSpecs.angles}</p>
            <p><strong>{isVideo ? 'Resolution/Framerate' : 'Image Specs'}:</strong> {concept.technicalSpecs.specs}</p>
            {isVideo && concept.technicalSpecs.cameraMovement && <p><strong>Camera Movement:</strong> {concept.technicalSpecs.cameraMovement}</p>}
            {isVideo && concept.technicalSpecs.editingStyle && <p><strong>Editing Style:</strong> {concept.technicalSpecs.editingStyle}</p>}
            {isVideo && concept.technicalSpecs.soundDesign && <p><strong>Sound Design:</strong> {concept.technicalSpecs.soundDesign}</p>}
        </DetailSection>

        <DetailSection title="✍️ Ad Copy & CTA">
          <div className="space-y-4">
            <div>
                <p className="font-semibold text-gray-300">Hook Line:</p>
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300">"{concept.hookLine}"</blockquote>
            </div>
             <div>
                <p className="font-semibold text-gray-300">Ad Copy:</p>
                <p>{concept.adCopy}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-300">Call to Action:</p>
                <p className="bg-gray-700 rounded-md p-2 text-center font-mono text-sm">{concept.cta}</p>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="📈 Trend Reasoning">
            <p>{concept.trendReasoning}</p>
        </DetailSection>
      </div>
    </div>
  );
};

export default AdConceptCard;
