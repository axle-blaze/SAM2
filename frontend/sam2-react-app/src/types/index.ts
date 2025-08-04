export interface MaskData {
  id: number;
  mask_png: string; // base64 encoded PNG mask
  selected?: boolean;
  color?: string;
  bbox?: number[];
  score?: number;
  area?: number;
  predicted_iou?: number;
  stability_score?: number;
}

export interface ImageData {
  width: number;
  height: number;
  src: string;
}

export interface SAM2Response {
  width: number;
  height: number;
  masks: string[];
  mask_count: number;
  error?: string;
}

export interface MaskResponse {
  image_id: string;
  masks: {
    masks: MaskData[];
    width: number;
    height: number;
  };
  total_masks: number;
  status: string;
}

export interface Point {
  x: number;
  y: number;
}