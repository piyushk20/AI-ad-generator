
import { GenerativePart } from '../types';

export const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // The result includes the data URL prefix (e.g., "data:image/png;base64,"), 
                // which needs to be removed.
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });

    const data = await base64EncodedDataPromise;
    return {
        inlineData: {
            mimeType: file.type,
            data,
        },
    };
};
