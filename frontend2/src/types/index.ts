export interface Mask {
  id: number;
  area: number;
  bbox: number[];
  mask_b64: string;
}

export interface MaskSelectionState {
  [maskId: number]: {
    isSelected: boolean;
    color: [number, number, number, number]; // RGBA
  };
}

export interface ImageInfo {
  image_id: string;
  width: number;
  height: number;
  created_at: string;
  original_image_b64?: string; // Add this field
  available_masks: Mask[];
}

export interface GenerateMasksResponse {
  message: string;
  image_id: string;
  mask_count: number;
  image_dimensions: {
    width: number;
    height: number;
  };
  mask_ids: number[];
}

export interface RenderMasksRequest {
  render_instructions: Array<{
    mask_id: number;
    color: [number, number, number, number] | null;
  }>;
}

export interface RenderMasksResponse {
  message: string;
  rendered_image_b64: string;
}

export interface MaskAtPointResponse {
  message: string;
  point: { x: number; y: number };
  mask_id: number | null;
  mask_area?: number;
  mask_bbox?: number[];
  total_containing_masks?: number;
  all_containing_masks?: number[];
}

export interface ListImagesResponse {
  images: Array<{
    image_id: string;
    width: number;
    height: number;
    created_at: string;
    mask_count: number;
  }>;
}
