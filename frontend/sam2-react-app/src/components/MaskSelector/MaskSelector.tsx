import React, { useState } from 'react';
import MaskedCanvas from '../MaskedCanvas/MaskedCanvas';

interface MaskData {
  id: number;
  mask_png: string;
  selected?: boolean;
  color?: string;
  bbox?: number[];
  score?: number;
}

interface MaskSelectorProps {
  base64Image: string;
  masks: MaskData[];
  width?: number;
  height?: number;
}

const MaskSelector: React.FC<MaskSelectorProps> = ({ 
  base64Image, 
  masks, 
  width = 800, 
  height = 600 
}) => {
  const [selectedMaskIds, setSelectedMaskIds] = useState<number[]>([]);
  const [maskColors, setMaskColors] = useState<{ [key: number]: string }>({});

  const toggleMask = (maskId: number) => {
    setSelectedMaskIds(prev => 
      prev.includes(maskId) 
        ? prev.filter(id => id !== maskId)
        : [...prev, maskId]
    );
  };

  const setMaskColor = (maskId: number, color: string) => {
    setMaskColors(prev => ({
      ...prev,
      [maskId]: color
    }));
  };

  // Enhance masks with selected colors
  const enhancedMasks = masks.map(mask => ({
    ...mask,
    color: maskColors[mask.id] || mask.color || '#ff0000'
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-lg font-semibold">Select Masks to Render:</h3>
        {masks.map((mask) => (
          <div key={mask.id} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              id={`mask-${mask.id}`}
              checked={selectedMaskIds.includes(mask.id)}
              onChange={() => toggleMask(mask.id)}
            />
            <label htmlFor={`mask-${mask.id}`} className="text-sm">
              Mask {mask.id} {mask.score && `(${(mask.score * 100).toFixed(1)}%)`}
            </label>
            <input
              type="color"
              value={maskColors[mask.id] || mask.color || '#ff0000'}
              onChange={(e) => setMaskColor(mask.id, e.target.value)}
              className="w-8 h-8 border rounded"
              title={`Color for mask ${mask.id}`}
            />
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Rendered Masks</h3>
        <MaskedCanvas
          base64Image={base64Image}
          masks={enhancedMasks}
          selectedMaskIds={selectedMaskIds}
          width={width}
          height={height}
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>Selected masks: {selectedMaskIds.length} / {masks.length}</p>
        <p>Only selected masks will be rendered with their assigned colors.</p>
        <p>All other pixels will be transparent.</p>
      </div>
    </div>
  );
};

export default MaskSelector;
