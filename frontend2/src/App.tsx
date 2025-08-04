import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';
import MaskGrid from './components/MaskGrid';
import LoadingSpinner from './components/LoadingSpinner';
import { apiService } from './services/api';
import { Mask, MaskSelectionState } from './types';
import './index.css';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number | undefined>();
  const [imageHeight, setImageHeight] = useState<number | undefined>();

  const generateMasks = useCallback(async (imageBase64: string) => {
    setIsLoading(true);
    setError(null);
    setRenderedImage(null);
    
    try {
      // Generate and store masks
      const result = await apiService.generateAndStoreMasks(imageBase64);
      setImageId(result.image_id);
      setImageWidth(result.image_dimensions.width);
      setImageHeight(result.image_dimensions.height);
      setCurrentImage(imageBase64);
      
      // Get detailed mask info
      const imageInfo = await apiService.getImageInfo(result.image_id);
      setMasks(imageInfo.available_masks);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate masks';
      setError(errorMessage);
      console.error('Error generating masks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderSelectedMasks = useCallback(async (selections: MaskSelectionState) => {
    if (!imageId) return;

    const renderInstructions = Object.entries(selections)
      .filter(([_, selection]) => selection.isSelected)
      .map(([maskId, selection]) => ({
        mask_id: parseInt(maskId),
        color: selection.color,
      }));

    if (renderInstructions.length === 0) {
      setRenderedImage(null);
      return;
    }

    try {
      const result = await apiService.renderMasks(imageId, {
        render_instructions: renderInstructions,
      });
      setRenderedImage(`data:image/png;base64,${result.rendered_image_b64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render masks';
      setError(errorMessage);
      console.error('Error rendering masks:', err);
    }
  }, [imageId]);

  const handleImageClick = useCallback(async (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageId || !imageWidth || !imageHeight) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;
    
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    try {
      const result = await apiService.getMaskAtPoint(imageId, x, y);
      
      if (result.mask_id !== null) {
        // Show success message or auto-select mask
        console.log(`Found mask ${result.mask_id} at point (${x}, ${y})`);
        // You could auto-select the mask here if desired
      } else {
        console.log(`No mask found at point (${x}, ${y})`);
      }
    } catch (err) {
      console.error('Error getting mask at point:', err);
    }
  }, [imageId, imageWidth, imageHeight]);

  const resetApp = () => {
    setCurrentImage(null);
    setImageId(null);
    setMasks([]);
    setRenderedImage(null);
    setError(null);
    setImageWidth(undefined);
    setImageHeight(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SAM Image Masking Interface
              </h1>
              <p className="text-gray-600 mt-2">
                Advanced image segmentation with interactive mask selection
              </p>
            </div>
            
            {currentImage && (
              <button
                onClick={resetApp}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Image
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6">
            <LoadingSpinner message="Generating masks... This may take a few minutes." />
          </div>
        )}

        {/* Image Upload Section */}
        {!currentImage && !isLoading && (
          <div className="text-center">
            <ImageUploader onImageUpload={generateMasks} isLoading={isLoading} />
          </div>
        )}

        {/* Image Display and Mask Selection */}
        {currentImage && (
          <div className="space-y-8">
            {/* Image Display */}
            <ImageDisplay
              originalImage={currentImage}
              renderedImage={renderedImage}
              onImageClick={handleImageClick}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
            />

            {/* Mask Grid */}
            {masks.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Mask Selection ({masks.length} masks found)
                </h2>
                <MaskGrid masks={masks} onSelectionChange={renderSelectedMasks} />
              </div>
            )}

            {/* Instructions */}
            {masks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  How to use:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click on mask thumbnails to select/deselect them</li>
                  <li>• Click on color bars below selected masks to customize colors</li>
                  <li>• Use "Select All" to quickly select all masks</li>
                  <li>• Click on the original image to find masks at specific points</li>
                  <li>• Switch between "Original Image" and "Rendered Masks" tabs to compare</li>
                  <li>• Download the rendered result using the Download button</li>
                </ul>
              </div>
            )}

            {/* Statistics */}
            {masks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{masks.length}</div>
                  <div className="text-sm text-gray-600">Total Masks</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {imageWidth && imageHeight ? `${imageWidth}×${imageHeight}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Image Dimensions</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {renderedImage ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Rendered Preview</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            SAM Image Masking Interface - Powered by Segment Anything Model
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
