import React, { useState, useEffect } from 'react';
import { useConfirmation } from '../../hooks/useConfirmation';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface ImageListItem {
  image_id: string;
  width: number;
  height: number;
  created_at: string;
  mask_count: number;
}

interface ImageSelectorProps {
  onImageSelect: (imageId: string) => void;
  currentImageId: string | null;
  className?: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ 
  onImageSelect, 
  currentImageId,
  className = '' 
}) => {
  const [images, setImages] = useState<ImageListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { showConfirmation, ConfirmationModal } = useConfirmation();


  // Some cahges
  const fetchImages = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent dropdown from closing
    
    showConfirmation(
      `Are you sure you want to delete image ${imageId}?`,
      async () => {
        try {
          const response = await fetch(`/images/${imageId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Refresh the list
          await fetchImages();
          
          // If deleted image was currently selected, clear selection
          if (currentImageId === imageId) {
            onImageSelect('');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete image');
          console.error('Error deleting image:', err);
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const selectedImage = images.find(img => img.image_id === currentImageId);

  return (
    <div className={`relative ${className}`}>
      <ConfirmationModal />
      
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {loading ? (
              <span className="text-gray-500">Loading images...</span>
            ) : selectedImage ? (
              <div>
                <div className="font-medium text-gray-900">
                  {selectedImage.image_id}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedImage.width}×{selectedImage.height} • {selectedImage.mask_count} masks
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Select an existing image...</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {images.length}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
          <button
            onClick={fetchImages}
            className="ml-2 text-red-800 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-auto">
          {/* Refresh Button */}
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={fetchImages}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Image List */}
          {images.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {loading ? 'Loading...' : 'No images found'}
            </div>
          ) : (
            <div className="py-1">
              {images.map((image) => (
                <div
                  key={image.image_id}
                  className={`group px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                    currentImageId === image.image_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent'
                  }`}
                  onClick={() => {
                    onImageSelect(image.image_id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {image.image_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {image.width}×{image.height} • {image.mask_count} masks
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(image.created_at)}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteImage(image.image_id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                      title="Delete image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ImageSelector;
