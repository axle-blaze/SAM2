import React, { useState } from 'react';
import { downloadImage } from '../utils/helpers';

interface ImageDisplayProps {
  originalImage: string | null;
  renderedImage: string | null;
  onImageClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  imageWidth?: number;
  imageHeight?: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  originalImage,
  renderedImage,
  onImageClick,
  imageWidth,
  imageHeight,
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'rendered'>('original');
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (onImageClick) {
      const rect = event.currentTarget.getBoundingClientRect();
      const scaleX = (imageWidth || event.currentTarget.naturalWidth) / rect.width;
      const scaleY = (imageHeight || event.currentTarget.naturalHeight) / rect.height;
      
      const x = Math.floor((event.clientX - rect.left) * scaleX);
      const y = Math.floor((event.clientY - rect.top) * scaleY);
      
      setClickCoords({ x, y });
      onImageClick(event);
    }
  };

  const handleDownload = () => {
    const imageToDownload = activeTab === 'rendered' && renderedImage ? renderedImage : originalImage;
    if (imageToDownload) {
      downloadImage(imageToDownload, `sam-${activeTab}-image.png`);
    }
  };

  if (!originalImage) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No image loaded</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('original')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'original'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Original Image
        </button>
        <button
          onClick={() => setActiveTab('rendered')}
          disabled={!renderedImage}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'rendered'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : renderedImage
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Rendered Masks
          {!renderedImage && (
            <span className="ml-2 text-xs">(Select masks to render)</span>
          )}
        </button>
      </div>

      {/* Image Container */}
      <div className="relative">
        <div className="p-4">
          <div className="relative inline-block max-w-full">
            <img
              src={activeTab === 'rendered' && renderedImage ? renderedImage : originalImage}
              alt={activeTab === 'rendered' ? 'Rendered masks' : 'Original image'}
              className="max-w-full h-auto rounded shadow-sm cursor-crosshair"
              onClick={handleImageClick}
            />
            
            {/* Click Coordinates Indicator */}
            {clickCoords && activeTab === 'original' && (
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${(clickCoords.x / (imageWidth || 1)) * 100}%`,
                  top: `${(clickCoords.y / (imageHeight || 1)) * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </div>
        </div>

        {/* Image Info Bar */}
        <div className="bg-gray-50 px-4 py-2 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              {imageWidth && imageHeight && (
                <span>{imageWidth} × {imageHeight}</span>
              )}
              {clickCoords && (
                <span className="text-blue-600">
                  Last click: ({clickCoords.x}, {clickCoords.y})
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs">
                {activeTab === 'rendered' ? 'Rendered masks overlay' : 'Click to select mask'}
              </span>
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering Status */}
      {activeTab === 'rendered' && !renderedImage && (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Select masks from the grid below to see the rendered result here.</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
