import React, { useState, useCallback } from 'react';
import { AdConcept, ConceptIdea, HooksAndCtas, ImageGenPrompt, VideoScript, AdvertStyle } from './types';
import { generateAdvertStyles, generateConceptIdeas, generateFullConcepts, generateHooksAndCtas, generateImagePrompts, generateVideoScripts, enhanceStylingNotes } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AdConceptCard from './components/AdConceptCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ConceptIdeaSelector from './components/ConceptIdeaSelector';
import ConceptEditor from './components/ConceptEditor';
import { fileToGenerativePart } from './utils/fileUtils';
import AdvertTypeSelector from './components/AdvertTypeSelector';
import ImageGenPromptDisplay from './components/ImageGenPromptDisplay';
import VideoScriptDisplay from './components/VideoScriptDisplay';
import AdvertStyleSelector from './components/AdvertStyleSelector';
import HookAndCtaSelector from './components/HookAndCtaSelector';

type Stage = 
  'initial' | 
  'imageUploaded' |
  'advertTypeSelected' |
  'generatingStyles' |
  'stylesGenerated' |
  'generatingIdeas' | 
  'ideasGenerated' | 
  'generatingFullConcepts' | 
  'reviewingConcepts' |
  'generatingHooksAndCtasForSelection' |
  'selectingHooksAndCtas' |
  'generatingFinalOutputs' |
  'finalOutputsGenerated';

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>('initial');
  
  // Inputs
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [advertType, setAdvertType] = useState<'still' | 'video' | null>(null);
  const [ctaUrl, setCtaUrl] = useState<string>('');
  const [ctaWhatsApp, setCtaWhatsApp] = useState<string>('');
  const [priceTag, setPriceTag] = useState<string>('');
  const [brandGuidelines, setBrandGuidelines] = useState<string>('');
  const [userConcept, setUserConcept] = useState<string>('');
  const [copyLanguage, setCopyLanguage] = useState<string>('English');
  
  // AI-Generated Content
  const [advertStyles, setAdvertStyles] = useState<AdvertStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<AdvertStyle | null>(null);
  const [conceptIdeas, setConceptIdeas] = useState<ConceptIdea[]>([]);
  const [adConcepts, setAdConcepts] = useState<AdConcept[]>([]);
  const [editableConcepts, setEditableConcepts] = useState<AdConcept[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [hooksAndCtasForSelection, setHooksAndCtasForSelection] = useState<HooksAndCtas | null>(null);
  const [imageGenPrompts, setImageGenPrompts] = useState<ImageGenPrompt[] | null>(null);
  const [videoScripts, setVideoScripts] = useState<VideoScript[] | null>(null);
  
  // State
  const [error, setError] = useState<string | null>(null);
  const [isEnhancingStyling, setIsEnhancingStyling] = useState<boolean>(false);


  const resetWorkflow = (keepImage: boolean = false) => {
    setStage(keepImage ? 'imageUploaded' : 'initial');
    if (!keepImage) {
        setImageFile(null);
        setImageUrl(null);
    }
    setError(null);
    setAdvertType(null);
    setAdvertStyles([]);
    setSelectedStyle(null);
    setConceptIdeas([]);
    setAdConcepts([]);
    setEditableConcepts([]);
    setReviewIndex(0);
    setHooksAndCtasForSelection(null);
    setImageGenPrompts(null);
    setVideoScripts(null);
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    resetWorkflow(true);
    setStage('imageUploaded');
  };

  const handleAdvertTypeSelect = (type: 'still' | 'video') => {
    setAdvertType(type);
    setStage('advertTypeSelected');
  };

  const handleGenerateStyles = useCallback(async () => {
    if (!imageFile || !advertType) return;
    setStage('generatingStyles');
    setError(null);
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const styles = await generateAdvertStyles(imagePart, advertType);
      setAdvertStyles(styles);
      setStage('stylesGenerated');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
      setStage('advertTypeSelected');
    }
  }, [imageFile, advertType]);

  const handleGenerateIdeas = useCallback(async () => {
    if (!imageFile || !selectedStyle || !advertType) {
      setError('Please ensure an image, advert type, and a trending style are selected.');
      return;
    }
    setStage('generatingIdeas');
    setError(null);
    setConceptIdeas([]);
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const ideas = await generateConceptIdeas(imagePart, { url: ctaUrl, whatsapp: ctaWhatsApp }, brandGuidelines, userConcept, selectedStyle, advertType);
      
      if (ideas && ideas.length > 0) {
        setConceptIdeas(ideas);
        setStage('ideasGenerated');
      } else {
        setError("The AI couldn't generate any ideas for this combination. Please try adjusting your inputs.");
        setStage('stylesGenerated');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
      setStage('stylesGenerated');
    }
  }, [imageFile, ctaUrl, ctaWhatsApp, brandGuidelines, userConcept, selectedStyle, advertType]);

  const handleGenerateFullConcepts = useCallback(async (selectedIdeas: ConceptIdea[]) => {
    if (!imageFile || !advertType || selectedIdeas.length !== 2) {
        setError("Something went wrong. Please start over.");
        return;
    }
    setStage('generatingFullConcepts');
    setError(null);
    setAdConcepts([]);
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const concepts = await generateFullConcepts(imagePart, { url: ctaUrl, whatsapp: ctaWhatsApp }, brandGuidelines, userConcept, selectedIdeas, advertType, selectedStyle!);
        setAdConcepts(concepts);
        setEditableConcepts(JSON.parse(JSON.stringify(concepts))); // Deep copy for editing
        setReviewIndex(0);
        setStage('reviewingConcepts');
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
        setStage('ideasGenerated');
    }
  }, [imageFile, ctaUrl, ctaWhatsApp, brandGuidelines, userConcept, advertType, selectedStyle]);

  const handleConceptEdit = useCallback((field: string, value: string) => {
    setEditableConcepts(prev => {
        const newConcepts = JSON.parse(JSON.stringify(prev));
        const conceptToEdit = newConcepts[reviewIndex];
        
        const fields = field.split('.');
        let currentLevel: any = conceptToEdit;
        for (let i = 0; i < fields.length - 1; i++) {
            if (currentLevel[fields[i]] === undefined) {
                currentLevel[fields[i]] = {};
            }
            currentLevel = currentLevel[fields[i]];
        }
        currentLevel[fields[fields.length - 1]] = value;

        return newConcepts;
    });
  }, [reviewIndex]);

  const handleEnhanceStyling = useCallback(async () => {
    const conceptToEnhance = editableConcepts[reviewIndex];
    if (!conceptToEnhance) return;
    setIsEnhancingStyling(true);
    setError(null);
    try {
        const newStylingNotes = await enhanceStylingNotes(conceptToEnhance);
        handleConceptEdit('stylingNotes', newStylingNotes);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? `Failed to enhance styling: ${err.message}` : 'An unknown error occurred during enhancement.');
    } finally {
        setIsEnhancingStyling(false);
    }
  }, [editableConcepts, reviewIndex, handleConceptEdit]);

  const handleGenerateHooksAndCtasForSelection = useCallback(async () => {
    if (!imageFile || editableConcepts.length === 0) return;
    setAdConcepts(editableConcepts); // Lock in the edits
    setStage('generatingHooksAndCtasForSelection');
    setError(null);
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const hooksResult = await generateHooksAndCtas(imagePart, editableConcepts, { url: ctaUrl, whatsapp: ctaWhatsApp }, copyLanguage);
      setHooksAndCtasForSelection(hooksResult);
      setStage('selectingHooksAndCtas');
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
       setStage('reviewingConcepts'); // Go back to editor on failure
    }
  }, [imageFile, editableConcepts, ctaUrl, ctaWhatsApp, copyLanguage]);

  const handleFinalizeAndGenerateOutputs = useCallback(async (conceptsWithSelectedCopy: AdConcept[]) => {
    if (!imageFile || !advertType || conceptsWithSelectedCopy.length === 0) return;
    setAdConcepts(conceptsWithSelectedCopy); // Lock in final concepts with selected copy
    setStage('generatingFinalOutputs');
    setError(null);
    try {
      const imagePart = await fileToGenerativePart(imageFile);

      if (advertType === 'still') {
        const prompts = await generateImagePrompts(imagePart, conceptsWithSelectedCopy, priceTag);
        setImageGenPrompts(prompts);
      } else {
        const scripts = await generateVideoScripts(imagePart, conceptsWithSelectedCopy);
        setVideoScripts(scripts);
      }
      setStage('finalOutputsGenerated');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
      setStage('selectingHooksAndCtas'); 
    }
  }, [imageFile, advertType, priceTag]);
  
  const conceptSelectorTitle = userConcept 
    ? "AI-Enhanced Concepts" 
    : "Choose Your Favorite Concepts";
  const conceptSelectorSubtitle = userConcept
    ? "We've enhanced your idea with trending, high-CTR strategies. Select your two favorite variations to build out."
    : "Select your two favorite high-level concepts to develop into full photoshoot plans.";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-8">
            
            {stage === 'initial' && (
                <div className="text-center animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Create High-Converting Ad Concepts
                    </h2>
                    <p className="text-gray-400 mt-2">
                    Start by uploading your product image.
                    </p>
                </div>
            )}
            
            <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} onError={setError} />
            
            {stage === 'imageUploaded' && (
                <AdvertTypeSelector onSelect={handleAdvertTypeSelect} />
            )}

            {stage === 'advertTypeSelected' && (
                 <div className="text-center animate-fade-in">
                    <button onClick={handleGenerateStyles} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                        Suggest Trending Styles
                    </button>
                </div>
            )}

            {stage === 'generatingStyles' && <LoadingSpinner text="Analyzing Trends..." />}

            {stage === 'stylesGenerated' && (
                <AdvertStyleSelector styles={advertStyles} onSelect={setSelectedStyle} selectedStyle={selectedStyle} />
            )}

            {selectedStyle && (stage === 'stylesGenerated' || stage === 'generatingIdeas' || stage === 'ideasGenerated') && (
                 <div className="mt-8 pt-8 border-t border-gray-700 space-y-4 animate-fade-in">
                    {/* CTA Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ctaUrl" className="block text-sm font-medium text-gray-300">CTA Target Website/URL (Optional)</label>
                            <input
                                type="text"
                                id="ctaUrl"
                                value={ctaUrl}
                                onChange={(e) => setCtaUrl(e.target.value)}
                                disabled={stage === 'generatingIdeas'}
                                className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="https://yourbrand.com/product"
                            />
                        </div>
                         <div>
                            <label htmlFor="ctaWhatsApp" className="block text-sm font-medium text-gray-300">CTA Target WhatsApp Number (Optional)</label>
                            <input
                                type="text"
                                id="ctaWhatsApp"
                                value={ctaWhatsApp}
                                onChange={(e) => setCtaWhatsApp(e.target.value)}
                                disabled={stage === 'generatingIdeas'}
                                className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="priceTag" className="block text-sm font-medium text-gray-300">Optional Price Tag Sticker (for Still Image)</label>
                        <input
                            type="text"
                            id="priceTag"
                            value={priceTag}
                            onChange={(e) => setPriceTag(e.target.value)}
                            disabled={stage === 'generatingIdeas' || advertType !== 'still'}
                            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                            placeholder="e.g., $99.99 or 25% OFF"
                        />
                    </div>
                    {/* Brand Guidelines */}
                    <div>
                        <label htmlFor="brandGuidelines" className="block text-sm font-medium text-gray-300">Brand Guidelines (Optional)</label>
                        <textarea
                            id="brandGuidelines"
                            value={brandGuidelines}
                            onChange={(e) => setBrandGuidelines(e.target.value)}
                            disabled={stage === 'generatingIdeas'}
                            rows={3}
                            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Tone: playful, energetic. Colors: vibrant blues and yellows. Keywords: innovative, fast, simple."
                        />
                         <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <p><strong>Examples:</strong></p>
                            <p>• <span className="font-semibold">Tone & Colors:</span> "Our brand is luxurious and minimalist. Use a sophisticated tone and a monochrome color palette (black, white, grey)."</p>
                            <p>• <span className="font-semibold">Keywords & Audience:</span> "Target young professionals. Use keywords like 'sustainable', 'eco-friendly', and 'ethically-sourced'."</p>
                            <p>• <span className="font-semibold">Negative Constraints:</span> "Avoid using humor or bright, neon colors. Do not show people's faces."</p>
                        </div>
                    </div>
                    {/* User Concept */}
                    <div>
                        <label htmlFor="userConcept" className="block text-sm font-medium text-gray-300">Your Ad Concept (Optional)</label>
                        <textarea
                            id="userConcept"
                            value={userConcept}
                            onChange={(e) => setUserConcept(e.target.value)}
                            disabled={stage === 'generatingIdeas'}
                            rows={3}
                            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Have an idea? Describe it here and the AI will enhance it."
                        />
                    </div>
                    <div className="text-center pt-4">
                        <button
                            onClick={handleGenerateIdeas}
                            disabled={stage === 'generatingIdeas'}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {stage === 'generatingIdeas' ? <LoadingSpinner text="Generating Ideas..." /> : 'Generate Concept Ideas'}
                        </button>
                    </div>
                 </div>
            )}
            
            {stage === 'ideasGenerated' && (
                <ConceptIdeaSelector 
                    ideas={conceptIdeas} 
                    onConfirm={handleGenerateFullConcepts} 
                    isLoading={stage === 'generatingFullConcepts'}
                    title={conceptSelectorTitle}
                    subtitle={conceptSelectorSubtitle}
                />
            )}
            
            {stage === 'generatingFullConcepts' && <LoadingSpinner text="Generating Full Concepts..." />}
            
            {(stage === 'reviewingConcepts' || stage === 'generatingHooksAndCtasForSelection') && editableConcepts.length > 0 && (
                <div className="animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Review & Refine Your Concepts
                        </h2>
                        <p className="text-gray-400 mt-2">
                            This is your chance to edit the AI's suggestions before generating the final copy and prompts.
                        </p>
                        <div className="flex justify-center items-center space-x-4 mt-4 text-lg font-semibold">
                            <button onClick={() => setReviewIndex(0)} className={reviewIndex === 0 ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}>Concept 1</button>
                            <span className="text-gray-600">|</span>
                            <button onClick={() => setReviewIndex(1)} className={reviewIndex === 1 ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}>Concept 2</button>
                        </div>
                    </div>
                    
                    <AdConceptCard concept={editableConcepts[reviewIndex]} />
                    <ConceptEditor 
                        concept={editableConcepts[reviewIndex]}
                        onEdit={handleConceptEdit}
                        onEnhanceStyling={handleEnhanceStyling}
                        isEnhancingStyling={isEnhancingStyling}
                    />

                    <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
                        <div className="text-center">
                            <label htmlFor="language-select" className="block text-lg font-medium text-gray-200 mb-2">
                                Select Language for Ad Copy
                            </label>
                            <select
                                id="language-select"
                                value={copyLanguage}
                                onChange={(e) => setCopyLanguage(e.target.value)}
                                className="w-full max-w-xs mx-auto bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Telugu">Telugu</option>
                                <option value="Marathi">Marathi</option>
                            </select>
                        </div>
                    </div>


                    <div className="text-center mt-8">
                         <button
                            onClick={handleGenerateHooksAndCtasForSelection}
                            disabled={stage === 'generatingHooksAndCtasForSelection'}
                            className="w-full max-w-md flex justify-center items-center mx-auto bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {stage === 'generatingHooksAndCtasForSelection' ? <LoadingSpinner text="Generating Copy..." /> : 'Finalize Edits & Generate Copy Options'}
                        </button>
                    </div>
                </div>
            )}

            {stage === 'generatingHooksAndCtasForSelection' && !hooksAndCtasForSelection && <LoadingSpinner text="Generating Copy Options..." />}

            {stage === 'selectingHooksAndCtas' && hooksAndCtasForSelection && (
                <HookAndCtaSelector
                    concepts={adConcepts}
                    hooksAndCtas={hooksAndCtasForSelection}
                    onConfirm={handleFinalizeAndGenerateOutputs}
                    isLoading={stage === 'generatingFinalOutputs'}
                />
            )}
            
            {stage === 'generatingFinalOutputs' && <LoadingSpinner text="Generating Final Outputs..." />}

            {stage === 'finalOutputsGenerated' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center">
                         <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                            Your Final Ad Package is Ready!
                        </h2>
                    </div>

                    {imageGenPrompts && <ImageGenPromptDisplay prompts={imageGenPrompts} />}
                    {videoScripts && <VideoScriptDisplay scripts={videoScripts} />}
                    
                    <div className="text-center pt-4">
                        <button onClick={() => resetWorkflow(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Start a New Project
                        </button>
                    </div>
                </div>
            )}
            
            {error && <ErrorMessage message={error} />}

        </div>
      </main>
    </div>
  );
};

export default App;