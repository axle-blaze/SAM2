import {
  GenerateMasksResponse,
  ImageInfo,
  RenderMasksRequest,
  RenderMasksResponse,
  MaskAtPointResponse,
  ListImagesResponse,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async generateAndStoreMasks(imageBase64: string, imageId?: string): Promise<GenerateMasksResponse> {
    const url = imageId 
      ? `${API_BASE_URL}/generate_and_store_masks?image_id=${encodeURIComponent(imageId)}`
      : `${API_BASE_URL}/generate_and_store_masks`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_image_b64: imageBase64,
      }),
    });

    return this.handleResponse<GenerateMasksResponse>(response);
  }

  async getImageInfo(imageId: string): Promise<ImageInfo> {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}/info`);
    return this.handleResponse<ImageInfo>(response);
  }

  async renderMasks(imageId: string, renderInstructions: RenderMasksRequest): Promise<RenderMasksResponse> {
    const response = await fetch(`${API_BASE_URL}/render_masks/${imageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderInstructions),
    });

    return this.handleResponse<RenderMasksResponse>(response);
  }

  async getMaskAtPoint(imageId: string, x: number, y: number): Promise<MaskAtPointResponse> {
    const response = await fetch(
      `${API_BASE_URL}/images/${imageId}/mask_at_point?x=${x}&y=${y}`
    );
    return this.handleResponse<MaskAtPointResponse>(response);
  }

  async listImages(): Promise<ListImagesResponse> {
    const response = await fetch(`${API_BASE_URL}/images`);
    return this.handleResponse<ListImagesResponse>(response);
  }
}

export const apiService = new ApiService();
