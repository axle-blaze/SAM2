"""
SAM2 Backend Services
Handles business logic for image processing and Beam integration
"""

import io
import base64
import numpy as np
from PIL import Image, ImageDraw
import requests
import json
import time
from typing import Dict, Any, Optional, Tuple

# Beam configuration
BEAM_ENDPOINT_URL = "https://sam-segmentation-1c9e3c6-v3.app.beam.cloud"
BEAM_API_BASE = "https://api.beam.cloud/v2"
BEAM_AUTH_TOKEN = "Bearer mFjna2hQQX1UQtkL0__Kk8vxSURDZdWsb45cFRdUzOTeOMsAdY62Eri4f_l6v-evi5XxMg8TPMWyPkf3S1aKgA=="

# In-memory storage (use database in production)
image_store = {}
mask_store = {}
task_store = {}


class ImageService:
    """Service for handling image operations"""
    
    @staticmethod
    def store_image(image_data: bytes) -> Tuple[str, Dict[str, Any]]:
        """Store uploaded image and return image_id and metadata"""
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Generate unique ID
        image_id = f"img_{len(image_store)}"
        
        # Store image data
        image_info = {
            "image_b64": img_str,
            "width": image.width,
            "height": image.height
        }
        image_store[image_id] = image_info
        
        return image_id, {
            "image_id": image_id,
            "image_b64": f"data:image/png;base64,{img_str}",
            "width": image.width,
            "height": image.height
        }
    
    @staticmethod
    def get_image(image_id: str) -> Optional[Dict[str, Any]]:
        """Get stored image data"""
        return image_store.get(image_id)
    
    @staticmethod
    def clear_image_data(image_id: str) -> Dict[str, Any]:
        """Clear all data for an image"""
        cleared = []
        
        if image_id in image_store:
            del image_store[image_id]
            cleared.append("image")
        
        if image_id in mask_store:
            del mask_store[image_id]
            cleared.append("masks")
        
        if image_id in task_store:
            del task_store[image_id]
            cleared.append("task")
        
        return {
            "image_id": image_id,
            "cleared": cleared,
            "message": f"Cleared data for image {image_id}"
        }
    
    @staticmethod
    def get_image_status(image_id: str) -> Dict[str, Any]:
        """Get comprehensive status of image processing"""
        status = {
            "image_id": image_id,
            "image_uploaded": image_id in image_store,
            "masks_generated": image_id in mask_store,
            "task_processing": image_id in task_store
        }
        
        if image_id in image_store:
            status["image_info"] = {
                "width": image_store[image_id]["width"],
                "height": image_store[image_id]["height"]
            }
        
        if image_id in mask_store:
            masks = mask_store[image_id]
            status["mask_info"] = {
                "total_masks": len(masks.get("masks", [])),
                "dimensions": {
                    "width": masks.get("width"),
                    "height": masks.get("height")
                }
            }
        
        if image_id in task_store:
            task_info = task_store[image_id]
            status["task_info"] = {
                "task_id": task_info["task_id"],
                "status": task_info["status"],
                "created_at": task_info["created_at"],
                "elapsed_time": time.time() - task_info["created_at"]
            }
        
        return status
    
    @staticmethod
    def list_all_images() -> Dict[str, Any]:
        """List all uploaded images with their status"""
        images = []
        
        for image_id in image_store.keys():
            image_info = {
                "image_id": image_id,
                "width": image_store[image_id]["width"],
                "height": image_store[image_id]["height"],
                "has_masks": image_id in mask_store,
                "processing": image_id in task_store
            }
            
            if image_id in mask_store:
                image_info["mask_count"] = len(mask_store[image_id].get("masks", []))
            
            images.append(image_info)
        
        return {
            "total_images": len(images),
            "images": images
        }


class BeamService:
    """Service for handling Beam SAM2 integration"""
    
    @staticmethod
    def test_connection() -> Dict[str, Any]:
        """Test connection to Beam endpoint"""
        try:
            headers = {"Content-Type": "application/json"}
            
            # Create a small test image (1x1 pixel)
            test_img = Image.new("RGB", (1, 1), (255, 255, 255))
            buffered = io.BytesIO()
            test_img.save(buffered, format="PNG")
            test_b64 = base64.b64encode(buffered.getvalue()).decode()
            
            payload = {"image_b64": test_b64}
            
            response = requests.post(
                BEAM_ENDPOINT_URL,
                headers=headers,
                data=json.dumps(payload),
                timeout=30
            )
            
            return {
                "beam_endpoint": BEAM_ENDPOINT_URL,
                "status_code": response.status_code,
                "response_size": len(response.content),
                "connection": "successful" if response.status_code in [200, 202] else "failed",
                "response_preview": response.text[:200] if response.text else "No response body"
            }
            
        except Exception as e:
            return {
                "beam_endpoint": BEAM_ENDPOINT_URL,
                "connection": "failed",
                "error": str(e)
            }
    
    @staticmethod
    def generate_masks(image_id: str) -> Dict[str, Any]:
        """Generate masks using Beam SAM2 endpoint"""
        if image_id not in image_store:
            raise ValueError("Image not found")
        
        image_data = image_store[image_id]
        payload = {"image_b64": image_data["image_b64"]}
        headers = {"Content-Type": "application/json"}
        
        try:
            print(f"Calling Beam endpoint: {BEAM_ENDPOINT_URL}")
            response = requests.post(
                BEAM_ENDPOINT_URL,
                headers=headers,
                data=json.dumps(payload),
                timeout=120
            )
            
            if response.status_code == 200:
                print(f"Beam endpoint returned {response.status_code} for image {image_id}")
                result = response.json()
                print(result)
                # Check if this is a task response (async)
                if "task_id" in result:
                    task_store[image_id] = {
                        "task_id": result["task_id"],
                        "status": "pending",
                        "created_at": time.time()
                    }
                    
                    return {
                        "image_id": image_id,
                        "task_id": result["task_id"],
                        "status": "processing",
                        "message": "Mask generation started. Use /check-task/{image_id} to check status."
                    }
                else:
                    # Direct response with masks
                    mask_store[image_id] = result
                    return {
                        "image_id": image_id,
                        "masks": result,
                        "total_masks": len(result.get("masks", [])),
                        "status": "completed"
                    }
            else:
                print(f"Beam endpoint failed with status {response.status_code}: {response.text}")
                # Fallback to mock data
                masks = MaskService.create_mock_masks(image_data["width"], image_data["height"])
                mask_store[image_id] = masks
                
                return {
                    "image_id": image_id,
                    "masks": masks,
                    "total_masks": len(masks["masks"]),
                    "status": "completed",
                    "note": "Using mock data (Beam endpoint unavailable)"
                }
                
        except (requests.RequestException, requests.Timeout) as e:
            print(f"Beam endpoint error: {str(e)}")
            # Fallback to mock data
            masks = MaskService.create_mock_masks(image_data["width"], image_data["height"])
            mask_store[image_id] = masks
            
            return {
                "image_id": image_id,
                "masks": masks,
                "total_masks": len(masks["masks"]),
                "status": "completed",
                "note": f"Using mock data (Beam error: {str(e)})"
            }
    
    @staticmethod
    def check_task_status(image_id: str) -> Dict[str, Any]:
        """Check the status of a Beam task"""
        if image_id not in task_store:
            raise ValueError("Task not found for this image")
        
        task_info = task_store[image_id]
        task_id = task_info["task_id"]
        
        headers = {
            "Authorization": BEAM_AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                f"{BEAM_API_BASE}/task/{task_id}/",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                task_status = response.json()
                
                if task_status.get("status") == "COMPLETE":
                    if "outputs" in task_status and task_status["outputs"]:
                        masks = task_status["outputs"][0]
                        mask_store[image_id] = masks
                        del task_store[image_id]
                        
                        return {
                            "image_id": image_id,
                            "status": "completed",
                            "masks": masks,
                            "total_masks": len(masks.get("masks", []))
                        }
                    else:
                        raise ValueError("Task completed but no output found")
                
                elif task_status.get("status") == "FAILED":
                    del task_store[image_id]
                    raise ValueError("Beam task failed")
                
                else:
                    return {
                        "image_id": image_id,
                        "status": "processing",
                        "task_id": task_id,
                        "message": "Task is still running"
                    }
            else:
                raise ValueError(f"Failed to check task status: {response.status_code}")
                
        except requests.RequestException as e:
            raise ValueError(f"Error checking task status: {str(e)}")


class MaskService:
    """Service for handling mask operations"""
    
    @staticmethod
    def get_mask_at_point(image_id: str, x: int, y: int) -> Dict[str, Any]:
        """Get mask that contains the specified point"""
        if image_id not in mask_store:
            if image_id in task_store:
                return {
                    "status": "processing",
                    "message": "Masks are still being generated. Please wait."
                }
            raise ValueError("Masks not found for this image")
        
        masks = mask_store[image_id]
        
        for mask in masks.get("masks", []):
            bbox = mask.get("bbox", [])
            if len(bbox) >= 4:
                if bbox[0] <= x <= bbox[0] + bbox[2] and bbox[1] <= y <= bbox[1] + bbox[3]:
                    return {
                        "mask": mask,
                        "point": {"x": x, "y": y},
                        "status": "found"
                    }
        
        return {
            "mask": None,
            "point": {"x": x, "y": y},
            "status": "no_mask_at_point"
        }
    
    @staticmethod
    def get_all_masks(image_id: str) -> Dict[str, Any]:
        """Get all masks for an image"""
        if image_id not in mask_store:
            if image_id in task_store:
                return {
                    "status": "processing",
                    "message": "Masks are still being generated. Please wait."
                }
            raise ValueError("Masks not found for this image")
        
        masks = mask_store[image_id]
        return {
            "image_id": image_id,
            "masks": masks,
            "total_masks": len(masks.get("masks", [])),
            "status": "completed"
        }
    
    @staticmethod
    def apply_color(image_id: str, mask_ids: list, color: str) -> Dict[str, Any]:
        """Apply color to selected masks"""
        if image_id not in image_store or image_id not in mask_store:
            raise ValueError("Image or masks not found")
        
        # Get original image
        original_data = image_store[image_id]
        img_data = base64.b64decode(original_data["image_b64"])
        image = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        # Create colored overlay
        overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
        
        masks = mask_store[image_id]
        masks_list = masks.get("masks", [])
        
        for mask_id in mask_ids:
            if mask_id < len(masks_list):
                mask_data = masks_list[mask_id]
                
                # Check if we have actual mask PNG data from SAM2
                if "mask_png" in mask_data:
                    try:
                        MaskService._apply_png_mask(overlay, mask_data, color)
                    except Exception as e:
                        print(f"Error processing mask PNG: {e}, falling back to bbox")
                        MaskService._apply_bbox_mask(overlay, mask_data, color)
                else:
                    MaskService._apply_bbox_mask(overlay, mask_data, color)
        
        # Composite the overlay onto the original image
        result = Image.alpha_composite(image, overlay)
        result = result.convert("RGB")
        
        # Convert back to base64
        buffered = io.BytesIO()
        result.save(buffered, format="PNG")
        result_b64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "colored_image": f"data:image/png;base64,{result_b64}",
            "applied_masks": mask_ids,
            "color": color
        }
    
    @staticmethod
    def _apply_png_mask(overlay: Image.Image, mask_data: Dict, color: str):
        """Apply color using actual mask PNG data"""
        mask_b64 = mask_data["mask_png"].split(",")[1]
        mask_img_data = base64.b64decode(mask_b64)
        mask_img = Image.open(io.BytesIO(mask_img_data)).convert("L")
        
        hex_color = color.lstrip('#')
        rgb_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        mask_rgba = Image.new("RGBA", mask_img.size, (0, 0, 0, 0))
        mask_array = np.array(mask_img)
        mask_rgba_array = np.array(mask_rgba)
        
        mask_rgba_array[mask_array > 0] = rgb_color + (128,)
        colored_mask = Image.fromarray(mask_rgba_array, "RGBA")
        
        if colored_mask.size != overlay.size:
            colored_mask = colored_mask.resize(overlay.size, Image.LANCZOS)
        
        overlay = Image.alpha_composite(overlay, colored_mask)
    
    @staticmethod
    def _apply_bbox_mask(overlay: Image.Image, mask_data: Dict, color: str):
        """Apply color using bounding box (fallback method)"""
        bbox = mask_data.get("bbox", [])
        if len(bbox) >= 4:
            draw = ImageDraw.Draw(overlay)
            hex_color = color.lstrip('#')
            rgb_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            rgba_color = rgb_color + (128,)
            
            draw.rectangle([
                bbox[0], bbox[1],
                bbox[0] + bbox[2], bbox[1] + bbox[3]
            ], fill=rgba_color)
    
    @staticmethod
    def create_mock_masks(width: int, height: int) -> Dict[str, Any]:
        """Create mock masks for demonstration purposes"""
        masks = []
        
        mask_configs = [
            {"x_ratio": 0.1, "y_ratio": 0.2, "w_ratio": 0.3, "h_ratio": 0.4, "score": 0.95},  # Left wall
            {"x_ratio": 0.45, "y_ratio": 0.15, "w_ratio": 0.4, "h_ratio": 0.5, "score": 0.92},  # Center wall
            {"x_ratio": 0.7, "y_ratio": 0.25, "w_ratio": 0.25, "h_ratio": 0.35, "score": 0.88},  # Right wall
            {"x_ratio": 0.2, "y_ratio": 0.05, "w_ratio": 0.6, "h_ratio": 0.15, "score": 0.85},  # Roof
            {"x_ratio": 0.3, "y_ratio": 0.65, "w_ratio": 0.4, "h_ratio": 0.3, "score": 0.82},  # Foundation
            {"x_ratio": 0.15, "y_ratio": 0.35, "w_ratio": 0.15, "h_ratio": 0.25, "score": 0.78},  # Window 1
            {"x_ratio": 0.55, "y_ratio": 0.3, "w_ratio": 0.15, "h_ratio": 0.2, "score": 0.75},  # Window 2
            {"x_ratio": 0.4, "y_ratio": 0.45, "w_ratio": 0.12, "h_ratio": 0.2, "score": 0.72},  # Door
        ]
        
        for i, config in enumerate(mask_configs):
            x = int(config["x_ratio"] * width)
            y = int(config["y_ratio"] * height)
            w = int(config["w_ratio"] * width)
            h = int(config["h_ratio"] * height)
            
            x = max(0, min(x, width - w))
            y = max(0, min(y, height - h))
            
            # Create mock mask PNG
            mask_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(mask_img)
            draw.rectangle([x, y, x + w, y + h], fill=(255, 255, 255, 255))
            
            buffered = io.BytesIO()
            mask_img.save(buffered, format="PNG")
            mask_b64 = base64.b64encode(buffered.getvalue()).decode()
            
            mask = {
                "id": i,
                "bbox": [x, y, w, h],
                "score": config["score"],
                "area": w * h,
                "mask_png": f"data:image/png;base64,{mask_b64}",
                "predicted_iou": config["score"] * 0.9,
                "stability_score": config["score"] * 0.8
            }
            masks.append(mask)
        
        return {
            "masks": masks,
            "width": width,
            "height": height
        }
