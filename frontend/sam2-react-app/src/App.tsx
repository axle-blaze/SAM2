import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload/ImageUpload';
import InteractiveCanvas from './components/Canvas/InteractiveCanvas';
import ToolPanel from './components/ToolPanel/ToolPanel';
import ColorPicker from './components/ColorPicker/ColorPicker';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import { useImageSegmentation } from './hooks/useImageSegmentation';
import { downloadImage } from './utils/imageUtils';
import './App.css';

const App: React.FC = () => {
  const {
    image,
    masks,
    loading,
    error,
    showAllMasks,
    canvasRef,
    uploadImage,
    generateMasks,
    toggleMaskSelection,
    applyColorToSelected,
    clearSelection,
    toggleShowAllMasks,
    reset
  } = useImageSegmentation();

  const [selectedColor, setSelectedColor] = useState('#ef4444');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    applyColorToSelected(color);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current);
    }
  };

  const selectedCount = masks.filter(mask => mask.selected).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">SAM2 Wall Painter</h1>
          <p className="text-gray-600 mt-2">Upload an image, generate masks, and paint walls with colors</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!image ? (
          /* Upload State */
          <div className="text-center">
            <ImageUpload onImageUpload={uploadImage} loading={loading} />
          </div>
        ) : (
          /* Editing State */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Canvas Area */}
            <div className="lg:col-span-3">
              <InteractiveCanvas
                image={image}
                masks={masks}
                onMaskClick={toggleMaskSelection}
                showAllMasks={showAllMasks}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ToolPanel
                onGenerateMasks={generateMasks}
                onClearSelection={clearSelection}
                onReset={reset}
                onDownload={handleDownload}
                onToggleShowAllMasks={toggleShowAllMasks}
                loading={loading}
                hasImage={!!image}
                hasMasks={masks.length > 0}
                selectedCount={selectedCount}
                showAllMasks={showAllMasks}
              />

              {masks.length > 0 && (
                <ColorPicker
                  onColorSelect={handleColorSelect}
                  selectedColor={selectedColor}
                />
              )}

              {masks.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Masks Info</h3>
                  <p className="text-sm text-gray-600">
                    Found: {masks.length} masks<br />
                    Selected: {selectedCount} masks
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;