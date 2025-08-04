import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload/ImageUpload';
import MaskSelector from './components/MaskSelector/MaskSelector';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import { MaskData, MaskResponse } from './types';
import './App.css';

const App: React.FC = () => {
  const [image, setImage] = useState<string>('');
  const [imageId, setImageId] = useState<string>('');
  const [masks, setMasks] = useState<MaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);

  const uploadImage = async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      // Upload image to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('http://localhost:8000/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      setImage(uploadData.image_b64);
      setImageId(uploadData.image_id);
      setImageWidth(uploadData.width);
      setImageHeight(uploadData.height);
      
      // Generate masks
      await generateMasks(uploadData.image_id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const generateMasks = async (imgId: string) => {
    try {
      // Start mask generation
      const generateResponse = await fetch(`http://localhost:8000/generate-masks/${imgId}`, {
        method: 'POST',
      });
      
      if (!generateResponse.ok) {
        throw new Error('Failed to generate masks');
      }
      
      // Poll for completion (you might want to implement websockets for real-time updates)
      await pollForMasks(imgId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mask generation failed');
    }
  };

  const pollForMasks = async (imgId: string) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:8000/get-all-masks/${imgId}`);
        
        if (response.ok) {
          const data: MaskResponse = await response.json();
          
          if (data.status === 'completed' && data.masks.masks.length > 0) {
            setMasks(data.masks.masks);
            return;
          }
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (err) {
        console.error('Error polling for masks:', err);
        attempts++;
      }
    }
    
    throw new Error('Timeout waiting for masks to be generated');
  };

  const reset = () => {
    setImage('');
    setImageId('');
    setMasks([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">SAM2 Mask Renderer</h1>
          <p className="text-gray-600 mt-2">Upload an image, generate masks, and render selected masks with colors</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!image ? (
          /* Upload State */
          <div className="text-center">
            <ImageUpload onImageUpload={uploadImage} loading={loading} />
          </div>
        ) : (
          /* Mask Selection and Rendering State */
          <div className="space-y-6">
            {/* Original Image Display */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Original Image</h3>
              <img 
                src={image} 
                alt="Original" 
                className="max-w-full h-auto border rounded"
                style={{ maxHeight: '400px' }}
              />
              <div className="mt-2 text-sm text-gray-600">
                Dimensions: {imageWidth} × {imageHeight} | Masks found: {masks.length}
              </div>
            </div>

            {/* Mask Selection and Rendering */}
            {masks.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <MaskSelector
                  base64Image={image.replace('data:image/png;base64,', '')}
                  masks={masks}
                  width={imageWidth}
                  height={imageHeight}
                />
              </div>
            )}

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={reset}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
