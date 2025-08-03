from beam import endpoint, Image
import base64
import io
import logging
import numpy as np
from PIL import Image as PILImage
import torch
import os
import binascii
import urllib.request
from pathlib import Path

# --- Configuration ---
# Inference dtype for mixed-precision
_AUTOCAST_DTYPE = torch.bfloat16

# SAM2.1 model paths and URL
_SAM2_CHECKPOINT_PATH = "/app/checkpoints/sam2.1_hiera_large.pt"
_SAM2_CFG_PATH = "configs/sam2.1/sam2.1_hiera_l.yaml"
_CHECKPOINT_URL = "https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt"

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Helper Functions ---
def fix_base64_padding(data: str) -> str:
    """
    Fixes common base64 padding issues and handles data URL prefixes.
    """
    data = data.strip().replace(' ', '').replace('\n', '').replace('\r', '')
    
    if data.startswith('data:'):
        _, data = data.split(',', 1)
    
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return data

def download_checkpoint():
    """
    Downloads the SAM2.1 checkpoint at runtime if it doesn't already exist.
    This avoids build timeouts on Beam.
    """
    checkpoint_path = Path(_SAM2_CHECKPOINT_PATH)
    
    if checkpoint_path.exists():
        logger.info(f"✅ Checkpoint already exists: {checkpoint_path}")
        return
    
    logger.info(f"📥 Downloading SAM2.1 checkpoint to {checkpoint_path}...")
    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        urllib.request.urlretrieve(_CHECKPOINT_URL, checkpoint_path)
        logger.info(f"✅ Checkpoint downloaded successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to download checkpoint: {e}")
        raise

# --- Beam Endpoint Definition ---
@endpoint(
    name="segment_image",
    gpu="A10G",
    cpu=2.0,
    memory="8Gi",
    keep_warm_seconds=300,
    image=Image(
        # Use an official PyTorch image with compatible CUDA/cuDNN
        base_image="nvcr.io/nvidia/pytorch:24.01-py3"
    ).add_commands([
        "apt-get update && apt-get install -y git wget && rm -rf /var/lib/apt/lists/*",
        # Clone the SAM2 repository
        "git clone --depth 1 https://github.com/facebookresearch/sam2.git /app/sam2",
        # Install the SAM2 library
        "cd /app/sam2 && pip install -e .",
        # Create the directory for the checkpoint (download happens at runtime)
        "mkdir -p /app/checkpoints"
    ]).add_python_packages([
        # Add remaining dependencies (torch is already in the base image)
        "numpy>=1.24.0",
        "Pillow>=9.0.0", 
        "opencv-python>=4.5.0",
        "hydra-core>=1.2.0",
        "omegaconf>=2.2.0"
    ])
)
def segment_image(image: str):
    """
    Segments a base64-encoded RGB image using Meta's SAM2.1 hierarchical model.
    """
    # Add sam2 library to Python path
    import sys
    sys.path.append('/app/sam2')
    
    from sam2.build_sam import build_sam2
    from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator
    from sam2.sam2_image_predictor import SAM2ImagePredictor

    # 1. Download checkpoint on the first run
    if not hasattr(segment_image, "checkpoint_downloaded"):
        download_checkpoint()
        segment_image.checkpoint_downloaded = True

    # 2. Lazy-load the model once and cache it
    if not hasattr(segment_image, "model_loaded") or not segment_image.model_loaded:
        try:
            logger.info("🔧 Loading SAM2.1 model...")
            
            if not os.path.exists(_SAM2_CHECKPOINT_PATH):
                raise FileNotFoundError(f"Checkpoint not found after download attempt: {_SAM2_CHECKPOINT_PATH}")
            
            model = build_sam2(
                _SAM2_CFG_PATH,
                _SAM2_CHECKPOINT_PATH,
                device="cuda",
                apply_postprocessing=True,
            )
            
            if torch.cuda.is_available():
                model = model.to("cuda")
                logger.info(f"✅ Model moved to GPU: {torch.cuda.get_device_name()}")
            else:
                logger.warning("⚠️ CUDA not available, using CPU")
                model = model.to("cpu")

            segment_image.sam2_model = model
            segment_image.mask_generator = SAM2AutomaticMaskGenerator(
                model,
                points_per_side=24,
                pred_iou_thresh=0.7,
                stability_score_thresh=0.92,
                crop_n_layers=0,
                min_mask_region_area=100,
            )
            
            segment_image.model_loaded = True
            logger.info("✅ SAM2.1 model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load SAM2.1 model: {e}")
            raise RuntimeError(f"Model loading failed: {e}")

    # 3. Decode and process the input image
    try:
        if not image or not isinstance(image, str):
            raise ValueError("Input must be a non-empty base64 string")
        
        image_fixed = fix_base64_padding(image)
        
        try:
            img_bytes = base64.b64decode(image_fixed)
        except binascii.Error as e:
            raise ValueError(f"Invalid base64 encoding after padding: {e}")
            
        if not img_bytes:
            raise ValueError("Decoded image data is empty")
            
        pil_img = PILImage.open(io.BytesIO(img_bytes)).convert("RGB")
        width, height = pil_img.size
            
        # Resize very large images to prevent out-of-memory errors
        max_size = 1536
        if width > max_size or height > max_size:
            logger.info(f"Resizing large image from {width}x{height} to max {max_size}px")
            pil_img.thumbnail((max_size, max_size), PILImage.Resampling.LANCZOS)
            width, height = pil_img.size
            
    except Exception as e:
        logger.error(f"❌ Image processing failed: {e}")
        raise ValueError(f"Invalid image input: {e}")

    img_array = np.array(pil_img)
    logger.info(f"📸 Image loaded: {width}x{height}px. Generating masks...")

    # 4. Generate masks with memory management
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        with torch.inference_mode():
            autocast_device = "cuda" if torch.cuda.is_available() else "cpu"
            with torch.autocast(autocast_device, dtype=_AUTOCAST_DTYPE):
                masks = segment_image.mask_generator.generate(img_array)
                
    except Exception as e:
        logger.error(f"❌ Mask generation failed: {e}")
        masks = []

    # 5. Fallback if primary generation fails
    if not masks:
        logger.warning("⚠️ No masks generated. Using fallback (center point) segmentation...")
        try:
            predictor = SAM2ImagePredictor(segment_image.sam2_model)
            predictor.set_image(img_array)
            center = np.array([[width / 2, height / 2]], dtype=np.float32)
            labels = np.array([1], dtype=np.int32)
            masks_np, scores, _ = predictor.predict(
                point_coords=center, point_labels=labels, multimask_output=False
            )
            if len(masks_np) > 0:
                masks = [{"segmentation": masks_np[0]}]
                logger.info(f"✅ Fallback generated 1 mask.")
        except Exception as e:
            logger.error(f"❌ Fallback segmentation also failed: {e}")
            return {"width": width, "height": height, "masks": [], "error": "Segmentation failed"}

    # 6. Encode masks to base64
    mask_b64_list = []
    for mask in masks:
        try:
            seg = mask.get("segmentation")
            if seg is None or seg.size == 0:
                continue
            
            binary_mask = (seg.astype(np.uint8)) * 255
            if np.sum(binary_mask) == 0:
                continue
                
            pil_mask = PILImage.fromarray(binary_mask, mode='L')
            buf = io.BytesIO()
            pil_mask.save(buf, format="PNG", optimize=True)
            mask_b64_list.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
        except Exception as e:
            logger.warning(f"⚠️ Failed to encode one mask: {e}")
            continue

    logger.info(f"✅ Successfully processed and returned {len(mask_b64_list)} masks.")
    return {"width": width, "height": height, "masks": mask_b64_list}
