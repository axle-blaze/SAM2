export interface MaskData {
  id: string;
  mask: string; // base64 encoded mask
  selected: boolean;
  color?: string;
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

export interface Point {
  x: number;
  y: number;
}