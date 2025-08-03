import axios from 'axios';
import { SAM2Response } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://sam2-segmentation-stable-ec89c96-v1.app.beam.cloud';
const SAM2_ENDPOINT = process.env.REACT_APP_SAM2_ENDPOINT || '';
const AUTH_TOKEN = process.env.AUTH || 'mFjna2hQQX1UQtkL0__Kk8vxSURDZdWsb45cFRdUzOTeOMsAdY62Eri4f_l6v-evi5XxMg8TPMWyPkf3S1aKgA==';

export const sam2Api = {
  async segmentImage(imageBase64: string): Promise<SAM2Response> {
    try {
      const response = await axios.post(`${API_BASE_URL}${SAM2_ENDPOINT}`, {
        image: imageBase64
      }, {
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('SAM2 API Error:', error);
      throw new Error('Failed to segment image');
    }
  }
};