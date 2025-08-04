import React, { useState } from 'react';
import { Mask, MaskSelectionState } from '../types';
import { rgbaToString, generateRandomColor } from '../utils/helpers';

interface ColorPickerProps {
  color: [number, number, number, number];
  onChange: (color: [number, number, number, number]) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, onClose }) => {
  const [r, g, b, a] = color;

  const handleColorChange = (component: 'r' | 'g' | 'b' | 'a', value: number) => {
    const newColor: [number, number, number, number] = [...color];
    const index = { r: 0, g: 1, b: 2, a: 3 }[component];
    newColor[index] = value;
    onChange(newColor);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Color Picker</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">R</label>
            <input
              type="range"
              min="0"
              max="255"
              value={r}
              onChange={(e) => handleColorChange('r', parseInt(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">{r}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">G</label>
            <input
              type="range"
              min="0"
              max="255"
              value={g}
              onChange={(e) => handleColorChange('g', parseInt(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">{g}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">B</label>
            <input
              type="range"
              min="0"
              max="255"
              value={b}
              onChange={(e) => handleColorChange('b', parseInt(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">{b}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">A</label>
            <input
              type="range"
              min="0"
              max="255"
              value={a}
              onChange={(e) => handleColorChange('a', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">{a}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: rgbaToString(color) }}
          />
          <div className="text-xs text-gray-600 flex-1">
            {rgbaToString(color)}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MaskItemProps {
  mask: Mask;
  isSelected: boolean;
  color: [number, number, number, number];
  onToggle: () => void;
  onColorChange: (color: [number, number, number, number]) => void;
}

const MaskItem: React.FC<MaskItemProps> = ({
  mask,
  isSelected,
  color,
  onToggle,
  onColorChange,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="relative border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Mask Thumbnail */}
      <div className="aspect-square mb-2 relative">
        <img
          src={`data:image/png;base64,${mask.mask_b64}`}
          alt={`Mask ${mask.id}`}
          className="w-full h-full object-cover rounded"
        />

        {/* Selection Overlay */}
        <div
          className={`absolute inset-0 border-2 rounded cursor-pointer transition-all ${
            isSelected
              ? 'border-blue-500 bg-blue-200 bg-opacity-30'
              : 'border-transparent hover:border-gray-300'
          }`}
          onClick={onToggle}
        />

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="absolute top-1 left-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />

        {/* Mask ID Badge */}
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {mask.id}
        </div>
      </div>

      {/* Mask Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <div>Area: {mask.area?.toLocaleString() || 'N/A'}</div>
        {mask.bbox && mask.bbox.length >= 4 && (
          <div className="text-gray-500">
            {mask.bbox[2]}×{mask.bbox[3]}
          </div>
        )}
      </div>

      {/* Color Picker */}
      {isSelected && (
        <div className="mt-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full h-6 rounded border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
            style={{
              backgroundColor: rgbaToString(color),
            }}
          />

          {showColorPicker && (
            <div className="absolute z-20 mt-1 left-0">
              <ColorPicker
                color={color}
                onChange={onColorChange}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MaskGridProps {
  masks: Mask[];
  onSelectionChange: (selections: MaskSelectionState) => void;
  selections?: MaskSelectionState; // Make it optional for backward compatibility
}

const MaskGrid: React.FC<MaskGridProps> = ({ masks, onSelectionChange, selections: controlledSelections }) => {
  const [internalSelections, setInternalSelections] = useState<MaskSelectionState>({});
  const [selectAllState, setSelectAllState] = useState<'none' | 'some' | 'all'>('none');

  // Use controlled selections if provided, otherwise use internal state
  const selections = controlledSelections || internalSelections;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setSelections = controlledSelections ? onSelectionChange : setInternalSelections;

  // Predefined colors for masks
  const defaultColors: [number, number, number, number][] = [
    [255, 0, 0, 128],    // Red
    [0, 255, 0, 128],    // Green
    [0, 0, 255, 128],    // Blue
    [255, 255, 0, 128],  // Yellow
    [255, 0, 255, 128],  // Magenta
    [0, 255, 255, 128],  // Cyan
    [255, 128, 0, 128],  // Orange
    [128, 0, 255, 128],  // Purple
    [255, 192, 203, 128], // Pink
    [128, 128, 128, 128], // Gray
    [0, 128, 0, 128],    // Dark Green
    [128, 0, 128, 128],  // Purple
  ];

  const updateSelectAllState = (newSelections: MaskSelectionState) => {
    const selectedCount = Object.values(newSelections).filter(s => s.isSelected).length;
    const totalCount = masks.length;

    if (selectedCount === 0) setSelectAllState('none');
    else if (selectedCount === totalCount) setSelectAllState('all');
    else setSelectAllState('some');
  };

  const handleSelectAll = () => {
    const newSelections: MaskSelectionState = {};
    const shouldSelectAll = selectAllState !== 'all';

    masks.forEach((mask, index) => {
      newSelections[mask.id] = {
        isSelected: shouldSelectAll,
        color: defaultColors[index % defaultColors.length],
      };
    });

    if (controlledSelections) {
      onSelectionChange(newSelections);
    } else {
      setInternalSelections(newSelections);
      onSelectionChange(newSelections);
    }
    setSelectAllState(shouldSelectAll ? 'all' : 'none');
  };

  const handleMaskToggle = (maskId: number) => {
    const maskIndex = masks.findIndex(m => m.id === maskId);
    const newSelections = { ...selections };
    
    if (!newSelections[maskId]) {
      newSelections[maskId] = {
        isSelected: true,
        color: defaultColors[maskIndex % defaultColors.length],
      };
    } else {
      newSelections[maskId] = {
        ...newSelections[maskId],
        isSelected: !newSelections[maskId].isSelected,
      };
    }

    if (controlledSelections) {
      onSelectionChange(newSelections);
    } else {
      setInternalSelections(newSelections);
      onSelectionChange(newSelections);
    }
    updateSelectAllState(newSelections);
  };

  const handleColorChange = (maskId: number, color: [number, number, number, number]) => {
    const newSelections = {
      ...selections,
      [maskId]: {
        ...selections[maskId],
        color,
      },
    };

    if (controlledSelections) {
      onSelectionChange(newSelections);
    } else {
      setInternalSelections(newSelections);
      onSelectionChange(newSelections);
    }
  };

  const setRandomColors = () => {
    const newSelections = { ...selections };
    Object.keys(newSelections).forEach(maskId => {
      if (newSelections[parseInt(maskId)].isSelected) {
        newSelections[parseInt(maskId)].color = generateRandomColor();
      }
    });

    if (controlledSelections) {
      onSelectionChange(newSelections);
    } else {
      setInternalSelections(newSelections);
      onSelectionChange(newSelections);
    }
  };

  const resetToDefaults = () => {
    const newSelections = { ...selections };
    Object.keys(newSelections).forEach(maskId => {
      const maskIndex = masks.findIndex(m => m.id === parseInt(maskId));
      if (newSelections[parseInt(maskId)].isSelected && maskIndex !== -1) {
        newSelections[parseInt(maskId)].color = defaultColors[maskIndex % defaultColors.length];
      }
    });

    if (controlledSelections) {
      onSelectionChange(newSelections);
    } else {
      setInternalSelections(newSelections);
      onSelectionChange(newSelections);
    }
  };

  // Update select all state when selections change
  React.useEffect(() => {
    updateSelectAllState(selections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections, masks.length]);

  const selectedCount = Object.values(selections).filter(s => s.isSelected).length;

  if (masks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No masks available. Upload an image to generate masks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectAllState === 'all'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {selectAllState === 'all' ? 'Deselect All' : 'Select All'}
            </button>

            <span className="text-sm text-gray-600">
              {selectedCount} of {masks.length} masks selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={setRandomColors}
              disabled={selectedCount === 0}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Randomize Colors
            </button>

            <button
              onClick={resetToDefaults}
              disabled={selectedCount === 0}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Reset Colors
            </button>
          </div>
        </div>
      </div>

      {/* Mask Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
        {masks.map((mask, index) => (
          <MaskItem
            key={mask.id}
            mask={mask}
            isSelected={selections[mask.id]?.isSelected || false}
            color={selections[mask.id]?.color || defaultColors[index % defaultColors.length]}
            onToggle={() => handleMaskToggle(mask.id)}
            onColorChange={(color) => handleColorChange(mask.id, color)}
          />
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
          <p>
            {selectedCount} mask{selectedCount !== 1 ? 's' : ''} selected for rendering.
            Click on mask thumbnails to toggle selection, and on color bars to customize colors.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaskGrid;
