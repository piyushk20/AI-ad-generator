import { GoogleGenAI, Type } from "@google/genai";
import { AdConcept, ConceptIdea, GenerativePart, HooksAndCtas, ImageGenPrompt, VideoScript, AdvertStyle, VideoShot } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface CtaDetails {
    url?: string;
    whatsapp?: string;
}

// Step 1: Generate 5 high-level, trending ad styles based on the image.
export const generateAdvertStyles = async (
    imagePart: GenerativePart,
    advertType: 'still' | 'video'
): Promise<AdvertStyle[]> => {
    const format = advertType === 'still' ? 'still image' : 'short 8-10 second video';
    const prompt = `Analyze the provided product image. Based on its category and appearance, generate 5 distinct, highly trending, and successful ad STYLES for a ${format} campaign. For each style, provide a catchy title and a brief summary explaining the style and why it's currently effective for getting high CTR. Examples for video could be "Unboxing ASMR" or "Dynamic User-Generated Content Style". Examples for still image could be "Cinematic Product Shot" or "Bold Minimalism".`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ { text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING }
                    },
                    required: ['title', 'summary']
                }
            },
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for advert styles:", response.text);
        throw new Error("The AI returned an invalid response for advert styles.");
    }
};

// Step 2: Generate 5 high-level concept ideas for the user to choose from, based on the selected style.
export const generateConceptIdeas = async (
    imagePart: GenerativePart,
    ctaDetails: CtaDetails,
    brandGuidelines: string,
    userConcept: string,
    selectedStyle: AdvertStyle,
    advertType: 'still' | 'video'
): Promise<ConceptIdea[]> => {
    const format = advertType === 'still' ? 'still image' : 'short 8-10 second video';
    let prompt: string;
    const coreInstruction = `Your task is to generate 5 distinct, highly trending, and attention-grabbing ad concept IDEAS for a ${format}, all aligned with the chosen ad style: "${selectedStyle.title}: ${selectedStyle.summary}". These should be high-level summaries, not full plans. Focus on what's current, viral, and proven to have a high CTR for this product category within the specified ad style.`;

    if (userConcept) {
        prompt = `You are a world-class AI creative director specializing in enhancing raw ideas into high-performing campaigns. A user has provided an image, their initial ad concept, a chosen format (${format}), and a guiding ad style.
        Your task is to act as a creative partner. Take the user's core idea and elevate it by blending it with 5 distinct, highly trending, and proven high-CTR (Click-Through Rate) strategies relevant to the product type, chosen format, and ad style. The goal is not to replace their idea, but to show them five professional, enhanced variations of it.

        ${coreInstruction}

        USER INPUTS:
        - Chosen Ad Style: "${selectedStyle.title}"
        - User's Raw Ad Concept to Enhance: "${userConcept}"
        - Brand Guidelines to consider: "${brandGuidelines || 'N/A'}"`;
    } else {
        prompt = `You are a world-class AI creative director. A user has provided an image, brand guidelines, a chosen format (${format}), and has chosen a guiding ad style.
        ${coreInstruction}

        USER INPUTS:
        - Chosen Ad Style: "${selectedStyle.title}"
        - Brand Guidelines: "${brandGuidelines || 'N/A'}"`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ { text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'A short, catchy, and descriptive title for the concept idea.' },
                        summary: { type: Type.STRING, description: `A one or two-sentence summary explaining the core of the highly trending, attention-grabbing ad concept for a ${format}.` }
                    },
                    required: ['title', 'summary']
                }
            },
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for ideas:", response.text);
        throw new Error("The AI returned an invalid response for concept ideas.");
    }
};

// Step 3: Generate full, detailed concepts based on the user's selection.
export const generateFullConcepts = async (
    imagePart: GenerativePart,
    ctaDetails: CtaDetails,
    brandGuidelines: string,
    userConcept: string,
    selectedIdeas: ConceptIdea[],
    advertType: 'still' | 'video',
    selectedStyle: AdvertStyle
): Promise<AdConcept[]> => {
    const isVideo = advertType === 'video';
    const format = isVideo ? 'short 8-10 second video' : 'still image';
    const budget = isVideo ? '$300,000 video commercial' : 'high-end commercial photoshoot';

    const prompt = `You are a world-class AI producer for a high-end creative agency. Your task is to take two user-selected ad concept ideas and flesh them out into complete, professional, agency-grade plans for a ${format}, reflecting a ${budget}. The final output must be extremely detailed, actionable, and optimized for high CTR, all while adhering to the user's chosen ad style.

    INITIAL USER INPUTS:
    - Target Format: ${format}
    - Chosen Ad Style: "${selectedStyle.title}: ${selectedStyle.summary}"
    - Website for CTA: "${ctaDetails.url || 'Not provided'}"
    - WhatsApp for CTA: "${ctaDetails.whatsapp || 'Not provided'}"
    - Brand Guidelines: "${brandGuidelines || 'N/A'}"

    USER'S CHOSEN CONCEPTS:
    1. Title: "${selectedIdeas[0].title}", Summary: "${selectedIdeas[0].summary}"
    2. Title: "${selectedIdeas[1].title}", Summary: "${selectedIdeas[1].summary}"
    
    For EACH of the two chosen concepts, generate a complete plan.
    1.  **Craft Ad Copy:** Write a compelling hook, ad copy, and a strong CTA. The CTA must be context-aware: if a URL is given, use it. If a WhatsApp number is given, use it. If both, suggest a CTA that incorporates both. If neither, use a generic CTA like "Learn More".
    2.  **Provide High-End Details:** For a still, detail the 'shootSetup'. For a video, detail the 'sceneDescription'. Recommend high-end cameras (e.g., ARRI Alexa, RED Komodo, Hasselblad, Phase One), lenses, and settings appropriate for a major commercial production. Include video-specific details like camera movement and sound design if it's a video.
    3.  **Justify Trend:** Explain why this high-budget execution will be attention-grabbing and lead to high CTR.

    Output a JSON array containing exactly TWO ad concept objects, one for each selected idea.`;
    
    const technicalSpecsProps: any = {
        camera: { type: Type.STRING, description: 'Recommended professional camera types (e.g., ARRI Alexa for video, Hasselblad X2D for still).' },
        lenses: { type: Type.STRING, description: isVideo ? 'Recommended lens style (e.g., Cinematic Anamorphic).' : 'Specific professional lenses (e.g., 85mm f/1.4).' },
        angles: { type: Type.STRING, description: isVideo ? 'Key shots and camera angles (e.g., Dynamic close-ups, wide establishing shots).' : 'Key angles for the photoshoot.' },
        specs: { type: Type.STRING, description: isVideo ? 'Video resolution and framerate (e.g., 4K, 24fps).' : 'Image specifications (e.g., High-resolution, 3:2 aspect ratio).' },
        mood: { type: Type.STRING, description: 'The overall mood, feeling, or aesthetic (e.g., Energetic and vibrant, dark and moody).' },
    };
    if (isVideo) {
        technicalSpecsProps.cameraMovement = { type: Type.STRING, description: 'Specific camera movements (e.g., Fast-paced dolly shots, slow pans).' };
        technicalSpecsProps.editingStyle = { type: Type.STRING, description: 'Editing style for the video (e.g., Quick cuts, seamless transitions).' };
        technicalSpecsProps.soundDesign = { type: Type.STRING, description: 'Key elements of the sound design and music.' };
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        optionName: { type: Type.STRING },
                        conceptSummary: { type: Type.STRING },
                        shootSetup: { type: Type.STRING, description: isVideo ? 'Detailed scene description.' : 'Detailed shoot setup description.' },
                        technicalSpecs: {
                            type: Type.OBJECT,
                            properties: technicalSpecsProps,
                            required: Object.keys(technicalSpecsProps)
                        },
                        stylingNotes: { type: Type.STRING },
                        postProduction: { type: Type.STRING },
                        hookLine: { type: Type.STRING },
                        adCopy: { type: Type.STRING },
                        cta: { type: Type.STRING },
                        trendReasoning: { type: Type.STRING },
                        format: { type: Type.STRING, description: `Set to "${isVideo ? 'Short Video' : 'Still Image'}"` },
                        videoDuration: isVideo ? { type: Type.STRING, description: 'The total duration of the video, e.g., "8 seconds".' } : undefined,
                    },
                    required: ['optionName', 'conceptSummary', 'shootSetup', 'technicalSpecs', 'stylingNotes', 'postProduction', 'hookLine', 'adCopy', 'cta', 'trendReasoning', 'format']
                }
            }
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for full concepts:", response.text);
        throw new Error("The AI returned an invalid response for full concepts.");
    }
};

// Step 4 (Enhancement): Enhance styling notes.
export const enhanceStylingNotes = async (concept: AdConcept): Promise<string> => {
    const prompt = `You are a professional photoshoot stylist. The user is refining an ad concept and wants to enhance the styling notes. Analyze the provided ad concept and expand upon the existing "Styling Notes" by suggesting 2-3 more specific, creative, and actionable prop or wardrobe items that would elevate the final shot and enhance the overall mood. Return ONLY the updated, complete text for the "Styling Notes" field as a single string.

    CURRENT AD CONCEPT:
    ${JSON.stringify(concept, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
    });
    
    return response.text.trim();
};

// Step 5: Generate Hooks and CTAs for selection
export const generateHooksAndCtas = async (
    imagePart: GenerativePart,
    concepts: AdConcept[],
    ctaDetails: CtaDetails,
    language: string
): Promise<HooksAndCtas> => {
    const prompt = `You are a direct-response copywriting expert specializing in high-CTR ad copy. The user has two finalized ad concepts and needs a selection of punchy hooks and high-impact CTAs written in ${language}.

    USER'S AD CONCEPTS:
    1. ${concepts[0].optionName}: ${concepts[0].conceptSummary}
    2. ${concepts[1].optionName}: ${concepts[1].conceptSummary}

    USER'S CTA DETAILS:
    - Website URL: ${ctaDetails.url || 'Not provided'}
    - WhatsApp Number: ${ctaDetails.whatsapp || 'Not provided'}

    TASK:
    1. Generate a list of 5 unique, punchy, and attention-grabbing HOOK lines in ${language}. These should be versatile enough to work for either concept.
    2. Generate a list of 5 unique, high-impact, and persuasive CALL TO ACTION (CTA) one-liners in ${language}. These CTAs MUST intelligently incorporate the provided Website URL and/or WhatsApp number. If both are provided, create CTAs that leverage them together (e.g., "Shop now at our website or message us on WhatsApp!"). If only one is provided, use it directly.

    Output the result in a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    ctas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['hooks', 'ctas']
            }
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for hooks and CTAs:", response.text);
        throw new Error("The AI returned an invalid response for hooks and CTAs.");
    }
};

// Step 6 (Final): Generate Image Prompts
export const generateImagePrompts = async (
    imagePart: GenerativePart,
    concepts: AdConcept[],
    priceTag?: string
): Promise<ImageGenPrompt[]> => {
    const prompt = `You are an expert prompt engineer for photorealistic image generation models like 'gemini-2.5-flash-image'. Your task is to convert two detailed ad concepts into two final, high-quality image generation prompts.

    AD CONCEPTS:
    1. Concept: ${JSON.stringify(concepts[0], null, 2)}
    2. Concept: ${JSON.stringify(concepts[1], null, 2)}
    
    OPTIONAL PRICE TAG: "${priceTag || 'Not provided'}"

    For EACH of the two concepts, create a JSON object with:
    1.  **conceptName**: The original name of the concept.
    2.  **prompt**: A single, detailed paragraph. Synthesize ALL details from the concept (shoot setup, styling, mood, technical specs like camera/lens type) into a rich, descriptive prompt. The prompt MUST generate a high-end, cinematic, professional commercial photograph.
    3.  **Crucially, the prompt MUST include instructions to render the following text elements stylishly onto the image:**
        - The hook line: "${concepts[0].hookLine}" (for the first prompt) and "${concepts[1].hookLine}" (for the second).
        - The CTA: "${concepts[0].cta}" (for the first prompt) and "${concepts[1].cta}" (for the second).
        - **Placement**: The text should be placed elegantly at the top or bottom.
    4.  **If a price tag is provided**, the prompt MUST also include instructions to add a visually appealing price tag sticker with the text "${priceTag}" in the top-right corner of the image, matching the overall ad aesthetic.
    5. **cta**: The original CTA string for the concept.

    Output a JSON array containing exactly TWO of these objects.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        conceptName: { type: Type.STRING },
                        prompt: { type: Type.STRING },
                        cta: { type: Type.STRING }
                    },
                    required: ['conceptName', 'prompt', 'cta']
                }
            }
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for image prompts:", response.text);
        throw new Error("The AI returned an invalid response for image prompts.");
    }
};

// Step 6 (Final): Generate Video Scripts
export const generateVideoScripts = async (
    imagePart: GenerativePart,
    concepts: AdConcept[]
): Promise<VideoScript[]> => {
    const prompt = `You are a world-class director and scriptwriter for a creative agency specializing in high-budget ($300,000) commercials. Your task is to convert two detailed video ad concepts into two professional, timestamped shooting scripts.

    AD CONCEPTS:
    1. Concept: ${JSON.stringify(concepts[0], null, 2)}
    2. Concept: ${JSON.stringify(concepts[1], null, 2)}

    For EACH of the two concepts, create a JSON object containing:
    1.  **conceptName**: The original name of the concept.
    2.  **shots**: An array of shot objects. Each shot must have a timestamp (e.g., "0:00-0:02") and detailed descriptions for 'camera', 'audio', 'narration', and 'graphics'.
    3.  **The script must be cinematic, professional, and reflect the high budget.** Use professional terminology (e.g., "ARRI Alexa Mini with anamorphic lenses", "dynamic dolly push-in", "foley sound design").
    4.  **Crucially, the final 2-3 seconds of the script MUST be an 'end card' shot.** The 'graphics' description for this final shot must explicitly include the hook line and the CTA from the concept.
    5. **cta**: The original CTA string for the concept.

    Output a JSON array containing exactly TWO of these video script objects.`;
    
    const shotSchema = {
        type: Type.OBJECT,
        properties: {
            timestamp: { type: Type.STRING },
            camera: { type: Type.STRING },
            audio: { type: Type.STRING },
            narration: { type: Type.STRING },
            graphics: { type: Type.STRING },
        },
        required: ['timestamp', 'camera', 'audio', 'narration', 'graphics']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        conceptName: { type: Type.STRING },
                        shots: { type: Type.ARRAY, items: shotSchema },
                        cta: { type: Type.STRING }
                    },
                    required: ['conceptName', 'shots', 'cta']
                }
            }
        }
    });
    
     try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse JSON for video scripts:", response.text);
        throw new Error("The AI returned an invalid response for video scripts.");
    }
};
