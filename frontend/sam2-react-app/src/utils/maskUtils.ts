import { MaskData } from '../types';

/**
 * Utility functions for working with mask data
 */

/**
 * Convert hex color to RGB tuple
 */
export function hexToRgb(hex: string): [number, number, number] {
  if (!hex) return [0, 0, 0];
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * Generate a random color for a mask
 */
export function generateRandomColor(): string {
  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff8000', '#8000ff', '#ff0080', '#80ff00', '#0080ff', '#ff8080',
    '#80ff80', '#8080ff', '#ffff80', '#ff80ff', '#80ffff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Assign random colors to masks that don't have colors
 */
export function assignColorsToMasks(masks: MaskData[]): MaskData[] {
  return masks.map(mask => ({
    ...mask,
    color: mask.color || generateRandomColor()
  }));
}

/**
 * Validate mask data structure
 */
export function isValidMask(mask: any): mask is MaskData {
  return (
    typeof mask === 'object' &&
    mask !== null &&
    typeof mask.id === 'number' &&
    typeof mask.mask_png === 'string' &&
    mask.mask_png.length > 0
  );
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const applyColorToMask = (
  originalCanvas: HTMLCanvasElement,
  maskBase64: string,
  color: string
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    
    // Draw original image
    ctx.drawImage(originalCanvas, 0, 0);
    
    // Create mask image
    const maskImg = new Image();
    maskImg.onload = () => {
      // Create temporary canvas for mask
      const maskCanvas = document.createElement('canvas');
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      
      // Draw mask
      maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
      const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Apply color where mask is white
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const maskPixels = maskData.data;
      
      // Parse color (assuming hex format)
      const hexColor = color.replace('#', '');
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      
      for (let i = 0; i < maskPixels.length; i += 4) {
        if (maskPixels[i] > 128) { // White pixel in mask
          data[i] = r;     // Red
          data[i + 1] = g; // Green
          data[i + 2] = b; // Blue
          // Alpha remains the same
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas);
    };
    maskImg.onerror = reject;
    maskImg.src = `data:image/png;base64,${maskBase64}`;
  });
};
