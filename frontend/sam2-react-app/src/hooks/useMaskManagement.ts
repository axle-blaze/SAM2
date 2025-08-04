import { useState, useCallback } from 'react';
import { MaskData, MaskResponse } from '../types';

interface UseMaskManagementReturn {
  masks: MaskData[];
  selectedMaskIds: number[];
  maskColors: { [key: number]: string };
  loading: boolean;
  error: string;
  setMasks: (masks: MaskData[]) => void;
  toggleMask: (maskId: number) => void;
  setMaskColor: (maskId: number, color: string) => void;
  selectAllMasks: () => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useMaskManagement = (): UseMaskManagementReturn => {
  const [masks, setMasks] = useState<MaskData[]>([]);
  const [selectedMaskIds, setSelectedMaskIds] = useState<number[]>([]);
  const [maskColors, setMaskColorsState] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMask = useCallback((maskId: number) => {
    setSelectedMaskIds(prev => 
      prev.includes(maskId) 
        ? prev.filter(id => id !== maskId)
        : [...prev, maskId]
    );
  }, []);

  const setMaskColor = useCallback((maskId: number, color: string) => {
    setMaskColorsState(prev => ({
      ...prev,
      [maskId]: color
    }));
  }, []);

  const selectAllMasks = useCallback(() => {
    setSelectedMaskIds(masks.map(mask => mask.id));
  }, [masks]);

  const clearSelection = useCallback(() => {
    setSelectedMaskIds([]);
  }, []);

  const reset = useCallback(() => {
    setMasks([]);
    setSelectedMaskIds([]);
    setMaskColorsState({});
    setError('');
    setLoading(false);
  }, []);

  return {
    masks,
    selectedMaskIds,
    maskColors,
    loading,
    error,
    setMasks,
    toggleMask,
    setMaskColor,
    selectAllMasks,
    clearSelection,
    setLoading,
    setError,
    reset
  };
};
