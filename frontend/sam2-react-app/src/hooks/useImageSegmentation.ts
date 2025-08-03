import { useState, useRef, useCallback } from 'react';
import { ImageData, MaskData, SAM2Response } from '../types';
import { sam2Api } from '../services/sam2Api';
import { convertFileToBase64, createImageFromBase64 } from '../utils/imageUtils';
import { generateId } from '../utils/maskUtils';

export const useImageSegmentation = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [masks, setMasks] = useState<MaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllMasks, setShowAllMasks] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      const base64 = await convertFileToBase64(file);
      const img = await createImageFromBase64(base64);
      
      setImage({
        width: img.width,
        height: img.height,
        src: `data:image/${file.type.split('/')[1]};base64,${base64}`
      });
      
      // Draw image on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!;
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      
    } catch (err) {
      setError('Failed to load image');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMasks = useCallback(async () => {
    if (!image) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get base64 from image src
      const base64 = image.src.split(',')[1];
      const response: SAM2Response = await sam2Api.segmentImage(base64);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const newMasks: MaskData[] = response.masks.map((mask, index) => ({
        id: generateId(),
        mask,
        selected: false,
        color: undefined
      }));
      
      setMasks(newMasks);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate masks');
    } finally {
      setLoading(false);
    }
  }, [image]);

  const toggleMaskSelection = useCallback((maskId: string, addToSelection: boolean = false, removeFromSelection: boolean = false) => {
    setMasks(prev => prev.map(mask => {
      if (mask.id === maskId) {
        if (removeFromSelection) {
          return { ...mask, selected: false };
        } else if (addToSelection) {
          return { ...mask, selected: true };
        } else {
          // Regular toggle
          return { ...mask, selected: !mask.selected };
        }
      }
      return addToSelection ? mask : { ...mask, selected: false }; // Clear others unless adding
    }));
  }, []);

  const applyColorToSelected = useCallback((color: string) => {
    setMasks(prev => prev.map(mask => 
      mask.selected 
        ? { ...mask, color }
        : mask
    ));
  }, []);

  const clearSelection = useCallback(() => {
    setMasks(prev => prev.map(mask => ({ ...mask, selected: false })));
  }, []);

  const toggleShowAllMasks = useCallback(() => {
    setShowAllMasks(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setMasks([]);
    setError(null);
    setShowAllMasks(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  return {
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
  };
};