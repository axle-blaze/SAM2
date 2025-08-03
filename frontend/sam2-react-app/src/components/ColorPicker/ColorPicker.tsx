import React from 'react';

const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#000000', '#ffffff', '#fbbf24'
];

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  selectedColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect, selectedColor }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Select Color</h3>
      <div className="grid grid-cols-6 gap-2">
        {colors.map(color => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
              selectedColor === color 
                ? 'border-gray-800 ring-2 ring-offset-2 ring-primary-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;