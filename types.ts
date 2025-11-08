export interface AdConcept {
  optionName: string;
  conceptSummary: string;
  shootSetup: string; // Used for "Shoot Setup" (Still) or "Scene Description" (Video)
  technicalSpecs: {
    // Still & Video
    camera: string;
    lenses: string; // Lenses (Still) or Lens Style (Video)
    angles: string; // Angles (Still) or Key Shots (Video)
    specs: string; // Image Specs (Still) or Resolution/Framerate (Video)
    mood: string;
    // Video only
    cameraMovement?: string;
    editingStyle?: string;
    soundDesign?: string;
  };
  stylingNotes: string;
  postProduction: string;
  hookLine: string;
  adCopy: string;
  cta: string;
  trendReasoning: string;
  // Metadata
  format: 'Still Image' | 'Short Video';
  videoDuration?: string;
}

export type EditableAdConceptFields = 'conceptSummary' | 'shootSetup' | 'stylingNotes' | 'postProduction' | 'adCopy' | 'trendReasoning';

export interface ConceptIdea {
  title: string;
  summary: string;
}

export interface AdvertStyle {
  title: string;
  summary: string;
}

export interface HooksAndCtas {
  hooks: string[];
  ctas: string[];
}

export interface GenerativePart {
    inlineData: {
      mimeType: string;
      data: string;
    };
}

export interface ImageGenPrompt {
  conceptName: string;
  prompt: string;
  cta: string;
}

export interface VideoShot {
  timestamp: string;
  camera: string;
  audio: string;
  narration: string;
  graphics: string;
}

export interface VideoScript {
  conceptName: string;
  shots: VideoShot[];
  cta: string;
}