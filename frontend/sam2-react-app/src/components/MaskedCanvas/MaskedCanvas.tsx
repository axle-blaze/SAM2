import React, { useEffect, useRef, useState } from 'react';

// Utility to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  if (!hex) return [0, 0, 0];
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

interface MaskData {
  id: number;
  mask_png: string; // base64 encoded PNG mask
  selected?: boolean;
  color?: string;
  bbox?: number[];
  score?: number;
}

interface MaskedCanvasProps {
  base64Image: string;
  masks: MaskData[];
  selectedMaskIds: number[];
  width?: number;
  height?: number;
}

const MaskedCanvas: React.FC<MaskedCanvasProps> = ({ 
  base64Image, 
  masks, 
  selectedMaskIds,
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!base64Image || !masks || masks.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const renderMasks = async () => {
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);
      
      // Create output image data - start with all transparent pixels
      const outputImageData = ctx.createImageData(width, height);
      
      // Process each selected mask
      for (const maskId of selectedMaskIds) {
        const mask = masks.find(m => m.id === maskId);
        if (!mask || !mask.mask_png) continue;

        await new Promise<void>((resolve) => {
          const maskImg = new Image();
          maskImg.crossOrigin = 'anonymous';
          
          maskImg.onload = () => {
            // Create a temporary canvas to draw the mask
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
              resolve();
              return;
            }

            // Draw mask image to temp canvas
            tempCtx.drawImage(maskImg, 0, 0, width, height);
            const maskImageData = tempCtx.getImageData(0, 0, width, height);

            // Get color for this mask
            const [r, g, b] = mask.color ? hexToRgb(mask.color) : [255, 255, 255];

            // Apply mask to output
            for (let i = 0; i < maskImageData.data.length; i += 4) {
              const maskPixel = maskImageData.data[i]; // Red channel (grayscale)
              
              // If pixel is part of mask (value > 0, typically 255 for white)
              if (maskPixel > 0) {
                outputImageData.data[i] = r;     // Red
                outputImageData.data[i + 1] = g; // Green
                outputImageData.data[i + 2] = b; // Blue
                outputImageData.data[i + 3] = 255; // Alpha (opaque)
              }
              // If pixel is not part of mask, it remains transparent (default RGBA = 0,0,0,0)
            }

            resolve();
          };

          maskImg.onerror = () => {
            console.error('Failed to load mask image for mask ID:', maskId);
            resolve();
          };

          // Extract base64 data from the data URL
          const base64Data = mask.mask_png.includes(',') 
            ? mask.mask_png.split(',')[1] 
            : mask.mask_png;
          maskImg.src = `data:image/png;base64,${base64Data}`;
        });
      }

      // Draw the final result to canvas
      ctx.putImageData(outputImageData, 0, 0);
    };

    renderMasks();
  }, [base64Image, masks, selectedMaskIds, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{
        border: '1px solid #ccc',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

export default MaskedCanvas;
