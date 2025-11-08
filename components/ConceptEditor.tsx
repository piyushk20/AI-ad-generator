import React from 'react';
import { AdConcept } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ConceptEditorProps {
  concept: AdConcept;
  onEdit: (field: string, value: string) => void;
  onEnhanceStyling: () => void;
  isEnhancingStyling: boolean;
}

const EditableField: React.FC<{ label: string; fieldName: string; value: string; onEdit: (field: string, value: string) => void; rows?: number, children?: React.ReactNode }> = ({ label, fieldName, value, onEdit, rows = 3, children }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-300">
                {label}
            </label>
            {children}
        </div>
        <textarea
            id={fieldName}
            value={value}
            onChange={(e) => onEdit(fieldName, e.target.value)}
            rows={rows}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        />
    </div>
);

const ConceptEditor: React.FC<ConceptEditorProps> = ({ concept, onEdit, onEnhanceStyling, isEnhancingStyling }) => {
  const isVideo = concept.format === 'Short Video';

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-4 border-t-2 border-blue-500">
      <h3 className="text-xl font-bold text-white mb-6">
        ✏️ Make Changes
      </h3>
      <div className="space-y-6">
        <EditableField label="Concept Summary" fieldName="conceptSummary" value={concept.conceptSummary} onEdit={onEdit} />
        <EditableField label="Ad Copy" fieldName="adCopy" value={concept.adCopy} onEdit={onEdit} rows={4} />
        <EditableField label={isVideo ? "Scene Description" : "Shoot Setup Details"} fieldName="shootSetup" value={concept.shootSetup} onEdit={onEdit} />
        <EditableField label="Styling Notes" fieldName="stylingNotes" value={concept.stylingNotes} onEdit={onEdit}>
            <button 
                onClick={onEnhanceStyling} 
                disabled={isEnhancingStyling}
                className="flex items-center text-xs bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isEnhancingStyling ? <LoadingSpinner text="Enhancing..."/> : '✨ Enhance'}
            </button>
        </EditableField>
        <EditableField label="Post-Production Notes" fieldName="postProduction" value={concept.postProduction} onEdit={onEdit} />
        <EditableField label="Trend Reasoning" fieldName="trendReasoning" value={concept.trendReasoning} onEdit={onEdit} />
        <h4 className="text-lg font-semibold text-white pt-4 border-t border-gray-700">Technical Specs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField label="Mood / Effect" fieldName="technicalSpecs.mood" value={concept.technicalSpecs.mood} onEdit={onEdit} />
            <EditableField label="Camera" fieldName="technicalSpecs.camera" value={concept.technicalSpecs.camera} onEdit={onEdit} />
            <EditableField label={isVideo ? "Lens Style" : "Lenses"} fieldName="technicalSpecs.lenses" value={concept.technicalSpecs.lenses} onEdit={onEdit} />
            <EditableField label={isVideo ? "Key Shots / Angles" : "Angles"} fieldName="technicalSpecs.angles" value={concept.technicalSpecs.angles} onEdit={onEdit} />
            <EditableField label={isVideo ? "Resolution / Framerate" : "Image Specs"} fieldName="technicalSpecs.specs" value={concept.technicalSpecs.specs} onEdit={onEdit} />
            {isVideo && (
                <>
                    <EditableField label="Camera Movement" fieldName="technicalSpecs.cameraMovement" value={concept.technicalSpecs.cameraMovement || ''} onEdit={onEdit} />
                    <EditableField label="Editing Style" fieldName="technicalSpecs.editingStyle" value={concept.technicalSpecs.editingStyle || ''} onEdit={onEdit} />
                    <EditableField label="Sound Design" fieldName="technicalSpecs.soundDesign" value={concept.technicalSpecs.soundDesign || ''} onEdit={onEdit} />
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ConceptEditor;