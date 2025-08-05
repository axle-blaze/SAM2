import base64
import io
import json
import os
import uuid
import requests
from typing import List, Optional, Tuple, Dict
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment Configuration
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
JSON_DB_PATH = os.getenv("JSON_DB_PATH", "/home/cognitiveview01/sam/SAM2/backend/data.json")
SAM_API_URL = os.getenv("SAM_API_URL", "")
SAM_API_TOKEN = os.getenv("SAM_API_TOKEN", "")
SAM_API_TIMEOUT = int(os.getenv("SAM_API_TIMEOUT", 150))
APP_TITLE = os.getenv("APP_TITLE", "SAM Image Masking API")
APP_DESCRIPTION = os.getenv("APP_DESCRIPTION", "API to generate masks using external SAM service and render them with colors")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

# Parse CORS origins from environment
cors_origins_str = os.getenv("CORS_ORIGINS", '["*"]')
try:
    import ast
    CORS_ORIGINS = ast.literal_eval(cors_origins_str)
except:
    CORS_ORIGINS = ["*"]

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Functions ---

def load_db() -> Dict[str, Dict]:
    """Load database from JSON file"""
    if os.path.exists(JSON_DB_PATH):
        try:
            with open(JSON_DB_PATH, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}

def save_db(db: Dict[str, Dict]):
    """Save database to JSON file"""
    os.makedirs(os.path.dirname(JSON_DB_PATH), exist_ok=True)
    with open(JSON_DB_PATH, 'w') as f:
        json.dump(db, f, indent=2)

def generate_unique_id() -> str:
    """Generate a unique ID for images"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_suffix = str(uuid.uuid4())[:8]
    return f"img_{timestamp}_{unique_suffix}"

# --- Pydantic Models ---

class Mask(BaseModel):
    id: int
    mask_b64: str
    bbox: List[int] = []
    area: int = 0

class GenerateMasksRequest(BaseModel):
    original_image_b64: str = Field(..., description="Base64 encoded original image")

class MaskRenderInstruction(BaseModel):
    mask_id: int
    color: Optional[Tuple[int, int, int, int]] = Field(
        None, description="RGBA tuple for mask color. If null, original pixels are shown."
    )

class RenderMasksRequest(BaseModel):
    render_instructions: List[MaskRenderInstruction] = Field(
        ..., description="List of masks to render with their colors"
    )

class RenderResponse(BaseModel):
    message: str
    rendered_image_b64: str

# --- External SAM API Integration ---

def call_external_sam_api(original_image_b64: str) -> Tuple[List[Mask], int, int]:
    """
    Calls the external SAM API to generate masks for the given image.
    Returns masks and image dimensions.
    """
    if not SAM_API_URL or not SAM_API_TOKEN:
        raise HTTPException(status_code=500, detail="SAM API configuration not found. Please check environment variables.")
    
    headers = {
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {SAM_API_TOKEN}'
    }
    
    # You may need to modify this payload based on what your SAM API expects
    json_payload = {
        "image": original_image_b64
    }
    
    try:
        response = requests.post(SAM_API_URL, headers=headers, json=json_payload, timeout=SAM_API_TIMEOUT)
        response.raise_for_status()
        print(response.json())  # Debugging line to see the response structure
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to call external SAM API: {str(e)}")
    
    try:
        resp_json = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid JSON response from external SAM API")
    
    # Extract masks from response
    processed_masks = resp_json.get('processed_masks', [])
    width = resp_json.get('width', 0)
    height = resp_json.get('height', 0)
    
    if not processed_masks:
        raise HTTPException(status_code=500, detail="No masks found in external SAM API response")
    
    masks = []
    for i, mask_data in enumerate(processed_masks):
        masks.append(Mask(
            id=mask_data.get('id', i + 1),
            mask_b64=mask_data.get('mask_b64', ''),
            bbox=mask_data.get('bbox', []),
            area=mask_data.get('area', 0)
        ))
    
    return masks, width, height

# --- Image Processing Function ---

def process_and_render_layered(
    original_image_b64: str,
    masks: List[Mask],
    instructions: List[MaskRenderInstruction],
    image_size: Tuple[int, int]
) -> str:
    """Renders only the specified masks with their individual colors on a transparent canvas."""
    
    # Decode original image to get pixel data (for cases where mask color is None)
    try:
        current_image_data = base64.b64decode(original_image_b64)
        original_image = Image.open(io.BytesIO(current_image_data)).convert("RGBA")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid original image data: {str(e)}")
    
    # Create a transparent canvas
    rendered_image = Image.new("RGBA", image_size, (0, 0, 0, 0))
    
    # Create mask lookup dictionary
    mask_dict = {mask.id: mask.mask_b64 for mask in masks}
    print(f"Processing {len(instructions)} mask instructions on transparent canvas")
    
    # Apply each mask instruction sequentially
    for instruction in instructions:
        mask_id = instruction.mask_id
        color = instruction.color
        
        print(f"Processing mask {mask_id} with color {color}")
        
        if mask_id in mask_dict:
            try:
                # Decode mask
                mask_data = base64.b64decode(mask_dict[mask_id])
                mask_image = Image.open(io.BytesIO(mask_data)).convert("L")
                
                # Resize mask to match image size if needed
                if mask_image.size != image_size:
                    mask_image = mask_image.resize(image_size, Image.NEAREST)
                
                # Get pixel access
                rendered_pixels = rendered_image.load()
                mask_pixels = mask_image.load()
                original_pixels = original_image.load()
                
                # Apply mask pixel by pixel
                for y in range(image_size[1]):
                    for x in range(image_size[0]):
                        # Check if pixel is part of mask (white pixel > threshold)
                        if mask_pixels[x, y] > 128:  # Threshold for mask detection
                            if color is None:
                                # If no color specified, use original image pixels
                                rendered_pixels[x, y] = original_pixels[x, y]
                            else:
                                # Handle alpha blending for semi-transparent colors
                                alpha = color[3] / 255.0
                                current_pixel = rendered_pixels[x, y]
                                
                                if alpha == 1.0:
                                    # Fully opaque - just use the color
                                    rendered_pixels[x, y] = (color[0], color[1], color[2], 255)
                                elif alpha > 0:
                                    # Alpha blend with existing pixel
                                    blended_r = int(color[0] * alpha + current_pixel[0] * (1 - alpha))
                                    blended_g = int(color[1] * alpha + current_pixel[1] * (1 - alpha))
                                    blended_b = int(color[2] * alpha + current_pixel[2] * (1 - alpha))
                                    rendered_pixels[x, y] = (blended_r, blended_g, blended_b, 255)
                            
            except Exception as e:
                print(f"Error processing mask {mask_id}: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error processing mask {mask_id}: {str(e)}")
        else:
            print(f"Mask {mask_id} not found in available masks")
    
    # Convert final image to base64
    buffered = io.BytesIO()
    rendered_image.save(buffered, format="PNG")
    result = base64.b64encode(buffered.getvalue()).decode('utf-8')
    print(f"Rendered image size: {len(result)} characters")
    return result
# --- API Endpoints ---

@app.post("/generate_and_store_masks")
async def generate_and_store_masks(
    payload: GenerateMasksRequest = Body(...),
    image_id: Optional[str] = Query(None, description="Optional custom ID. If not provided, a unique ID will be generated")
):
    """
    Generates masks using external SAM API and stores them with the image.
    """
    
    # Generate unique ID if not provided
    if image_id is None:
        image_id = generate_unique_id()
    
    # Load current database
    db = load_db()
    
    # Check if image_id already exists
    if image_id in db:
        raise HTTPException(status_code=400, detail=f"Image with ID '{image_id}' already exists. Use a different ID.")
    
    # Call external SAM API to generate masks
    try:
        masks, width, height = call_external_sam_api(payload.original_image_b64)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error calling SAM API: {str(e)}")
    # Strip data URL prefix if present
    if payload.original_image_b64.startswith('data:image/'):
        # Find the comma that separates the header from the base64 data
        comma_index = payload.original_image_b64.find(',')
        if comma_index != -1:
            payload.original_image_b64 = payload.original_image_b64[comma_index + 1:]
    # Store in database using model_dump instead of dict
    db[image_id] = {
        "original_image_b64": payload.original_image_b64,
        "masks": [mask.model_dump() for mask in masks],
        "width": width,
        "height": height,
        "created_at": datetime.now().isoformat()
    }
    
    # Save database to file
    save_db(db)
    
    return {
        "message": f"Masks generated and stored successfully for image_id: {image_id}",
        "image_id": image_id,
        "mask_count": len(masks),
        "image_dimensions": {"width": width, "height": height},
        "mask_ids": [mask.id for mask in masks]
    }

@app.post("/render_masks/{image_id}", response_model=RenderResponse)
async def render_masks(
    image_id: str,
    request: RenderMasksRequest = Body(...)
):
    """
    Renders only the specified masks with their colors on the stored image.
    """
    
    # Load database
    db = load_db()
    
    # Check if image exists in database
    if image_id not in db:
        raise HTTPException(status_code=404, detail=f"Image with ID '{image_id}' not found")
    
    record = db[image_id]
    original_image_b64 = record["original_image_b64"]
    
    # Convert stored mask dicts back to Mask objects
    masks = [Mask(**mask_data) for mask_data in record["masks"]]
    
    # Get image dimensions
    width = record.get("width")
    height = record.get("height")
    
    if not width or not height:
        # Fallback: decode image to get dimensions
        try:
            original_bytes = base64.b64decode(original_image_b64)
            with Image.open(io.BytesIO(original_bytes)) as img:
                width, height = img.size
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot determine image dimensions: {str(e)}")
    
    # Render the image with specified masks and colors
    try:
        rendered_image_b64 = process_and_render_layered(
            original_image_b64=original_image_b64,
            masks=masks,
            instructions=request.render_instructions,
            image_size=(width, height)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during rendering: {str(e)}")
    
    return RenderResponse(
        message="Image rendered successfully with specified masks and colors",
        rendered_image_b64=rendered_image_b64
    )

@app.get("/images/{image_id}/info")
async def get_image_info(image_id: str):
    """
    Get information about stored image and available masks.
    """
    # Load database
    db = load_db()
    
    if image_id not in db:
        raise HTTPException(status_code=404, detail=f"Image with ID '{image_id}' not found")
    
    record = db[image_id]
    masks = [Mask(**mask_data) for mask_data in record["masks"]]
    
    return {
        "image_id": image_id,
        "width": record.get("width"),
        "height": record.get("height"),
        "created_at": record.get("created_at"),
        "original_image_b64": record.get("original_image_b64"),  # Include original image
        "available_masks": [
            {
                "id": mask.id,
                "area": mask.area,
                "bbox": mask.bbox,
                "mask_b64": mask.mask_b64  # Base64 encoded PNG mask
            } for mask in masks
        ]
    }

@app.get("/images")
async def list_images():
    """
    List all stored images.
    """
    db = load_db()
    
    images = []
    for image_id, record in db.items():
        images.append({
            "image_id": image_id,
            "width": record.get("width"),
            "height": record.get("height"),
            "created_at": record.get("created_at"),
            "mask_count": len(record.get("masks", []))
        })
    
    return {"images": images}

@app.get("/images/{image_id}/mask_at_point")
async def get_mask_at_point(
    image_id: str,
    x: int = Query(..., description="X coordinate"),
    y: int = Query(..., description="Y coordinate")
):
    """
    Find the most appropriate mask ID for given x,y coordinates based on bounding boxes.
    Returns the mask with the smallest area that contains the point.
    """
    # Load database
    db = load_db()
    
    if image_id not in db:
        raise HTTPException(status_code=404, detail=f"Image with ID '{image_id}' not found")
    
    record = db[image_id]
    masks = [Mask(**mask_data) for mask_data in record["masks"]]
    
    # Get image dimensions for validation
    width = record.get("width")
    height = record.get("height")
    
    if not width or not height:
        raise HTTPException(status_code=400, detail="Image dimensions not available")
    
    # Validate coordinates are within image bounds
    if x < 0 or x >= width or y < 0 or y >= height:
        raise HTTPException(
            status_code=400, 
            detail=f"Coordinates ({x}, {y}) are outside image bounds (0-{width-1}, 0-{height-1})"
        )
    
    # Find masks that contain the point
    containing_masks = []
    
    for mask in masks:
        bbox = mask.bbox
        if len(bbox) >= 4:  # bbox format: [x_min, y_min, x_max, y_max]
            x_min, y_min, x_max, y_max = bbox[:4]
            
            # Check if point is within bounding box
            if x_min <= x <= x_max and y_min <= y <= y_max:
                containing_masks.append({
                    "mask_id": mask.id,
                    "area": mask.area,
                    "bbox": bbox,
                    "bbox_area": (x_max - x_min) * (y_max - y_min)
                })
    
    if not containing_masks:
        return {
            "message": f"No mask found containing point ({x}, {y})",
            "point": {"x": x, "y": y},
            "mask_id": None,
            "total_masks_checked": len(masks)
        }
    
    # Sort by area (smallest first) to get the most specific mask
    containing_masks.sort(key=lambda m: m["area"])
    best_mask = containing_masks[0]
    
    return {
        "message": f"Found mask containing point ({x}, {y})",
        "point": {"x": x, "y": y},
        "mask_id": best_mask["mask_id"],
        "mask_area": best_mask["area"],
        "mask_bbox": best_mask["bbox"],
        "total_containing_masks": len(containing_masks),
        "all_containing_masks": [m["mask_id"] for m in containing_masks]
    }


@app.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """
    Delete a stored image and all its associated masks.
    """
    # Load database
    db = load_db()
    
    if image_id not in db:
        raise HTTPException(status_code=404, detail=f"Image with ID '{image_id}' not found")
    
    # Remove the image from database
    del db[image_id]
    
    # Save updated database
    save_db(db)
    
    return {
        "message": f"Image '{image_id}' deleted successfully",
        "image_id": image_id
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
