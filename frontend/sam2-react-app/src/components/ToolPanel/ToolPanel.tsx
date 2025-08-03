import React from 'react';

interface ToolPanelProps {
  onGenerateMasks: () => void;
  onClearSelection: () => void;
  onReset: () => void;
  onDownload: () => void;
  onToggleShowAllMasks: () => void;
  loading: boolean;
  hasImage: boolean;
  hasMasks: boolean;
  selectedCount: number;
  showAllMasks: boolean;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ 
  onGenerateMasks, 
  onClearSelection, 
  onReset, 
  onDownload,
  onToggleShowAllMasks,
  loading,
  hasImage,
  hasMasks,
  selectedCount,
  showAllMasks
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
      <div className="flex flex-col space-y-2">
        <button
          onClick={onGenerateMasks}
          disabled={!hasImage || loading}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Masks'}
        </button>
        
        <button
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear Selection ({selectedCount})
        </button>
        
        <button
          onClick={onToggleShowAllMasks}
          disabled={!hasMasks}
          className={`px-4 py-2 rounded-md transition-colors ${
            showAllMasks 
              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {showAllMasks ? 'Hide All Masks' : 'Show All Masks'}
        </button>
        
        <button
          onClick={onDownload}
          disabled={!hasMasks}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Download Image
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Reset
        </button>
      </div>
      
      {hasMasks && (
        <div className="text-sm text-gray-600 pt-2 border-t">
          <p>Instructions:</p>
          <ul className="list-disc list-inside text-xs space-y-1 mt-1">
            <li>Click on image to select masks</li>
            <li>Choose a color from the palette</li>
            <li>Click "Download" to save result</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToolPanel;