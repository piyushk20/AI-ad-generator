
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  onError: (message: string) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, onError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File | null) => {
    if (!file) return;

    // Validation 1: File type
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError(`Invalid file type. Please upload a PNG, JPG, or WEBP.`);
      return;
    }

    // Validation 2: File size
    if (file.size > MAX_SIZE_BYTES) {
      onError(`File is too large. Maximum size is 10MB.`);
      return;
    }
    
    // onImageUpload will clear previous errors via the main app's resetWorkflow
    onImageUpload(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  }, [onImageUpload, onError]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div>
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
        ${isDragging ? 'border-blue-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 bg-gray-700'}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Product preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center">
             <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;