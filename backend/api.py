"""
SAM2 Backend API Routes
FastAPI endpoints for image segmentation workflow
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from service import ImageService, BeamService, MaskService


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(title="SAM2 Image Segmentation API", version="1.0.0")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # React app URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app


# Create app instance
app = create_app()


# Health and utility endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "SAM2 Image Segmentation API", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2025-08-03"}


@app.get("/test-beam")
async def test_beam_connection():
    """Test connection to Beam endpoint"""
    return BeamService.test_connection()


# Image management endpoints
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return its base64 representation"""
    try:
        contents = await file.read()
        image_id, result = ImageService.store_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


@app.get("/status/{image_id}")
async def get_image_status(image_id: str):
    """Get the current status of an image processing workflow"""
    return ImageService.get_image_status(image_id)


@app.get("/list-images")
async def list_all_images():
    """List all uploaded images and their status"""
    return ImageService.list_all_images()


@app.delete("/clear-data/{image_id}")
async def clear_image_data(image_id: str):
    """Clear all data for an image"""
    return ImageService.clear_image_data(image_id)


# Mask generation endpoints
@app.post("/generate-masks/{image_id}")
async def generate_masks(image_id: str):
    """Generate masks using the Beam SAM2 endpoint"""
    try:
        return BeamService.generate_masks(image_id)
    except ValueError as e:
        if "Image not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating masks: {str(e)}")


@app.get("/check-task/{image_id}")
async def check_task_status(image_id: str):
    """Check the status of a Beam task"""
    try:
        return BeamService.check_task_status(image_id)
    except ValueError as e:
        if "Task not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking task: {str(e)}")


# Mask interaction endpoints
@app.get("/get-mask/{image_id}")
async def get_mask_at_point(image_id: str, x: int, y: int):
    """Get the mask that contains the specified point"""
    try:
        return MaskService.get_mask_at_point(image_id, x, y)
    except ValueError as e:
        if "Masks not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting mask: {str(e)}")


@app.get("/get-all-masks/{image_id}")
async def get_all_masks(image_id: str):
    """Get all masks for an image"""
    try:
        return MaskService.get_all_masks(image_id)
    except ValueError as e:
        if "Masks not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting masks: {str(e)}")


@app.post("/apply-color/{image_id}")
async def apply_color(
    image_id: str, 
    mask_ids: List[int], 
    color: str = "#FF0000"
):
    """Apply color to selected masks and return the colored image"""
    try:
        return MaskService.apply_color(image_id, mask_ids, color)
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying color: {str(e)}")
