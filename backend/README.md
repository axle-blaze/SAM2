# SAM2 Backend API

FastAPI backend for SAM2 image segmentation with Beam integration.

## � Project Structure

```
backend/
├── main.py          # Entry point - starts the server
├── api.py           # FastAPI routes and endpoints
├── service.py       # Business logic and services
├── requirements.txt # Dependencies
├── test_api.py      # API test suite
└── README.md        # This file
```

## 🏗️ Architecture

### **main.py**
- Application entry point
- Starts uvicorn server
- Minimal file for clean separation

### **api.py** 
- FastAPI application and routes
- Request/response handling
- HTTP error handling
- CORS configuration

### **service.py**
- Business logic classes:
  - `ImageService` - Image upload/storage/management
  - `BeamService` - SAM2 Beam integration 
  - `MaskService` - Mask processing and coloring
- No HTTP dependencies - pure business logic

## �🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

Server runs on: `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

## 📡 API Endpoints

### **Health & Utility**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /test-beam` - Test Beam connection

### **Image Management**
- `POST /upload-image` - Upload image file
- `GET /status/{image_id}` - Get image processing status
- `GET /list-images` - List all images
- `DELETE /clear-data/{image_id}` - Clear image data

### **Mask Generation**
- `POST /generate-masks/{image_id}` - Generate masks via Beam
- `GET /check-task/{image_id}` - Check async task status

### **Mask Interaction**
- `GET /get-mask/{image_id}?x={x}&y={y}` - Get mask at point
- `GET /get-all-masks/{image_id}` - Get all masks
- `POST /apply-color/{image_id}` - Apply color to masks

## 🔧 Services

### **ImageService**
```python
# Store and manage uploaded images
image_id, result = ImageService.store_image(image_bytes)
image_data = ImageService.get_image(image_id)
status = ImageService.get_image_status(image_id)
```

### **BeamService**
```python
# Integrate with Beam SAM2 endpoint
connection = BeamService.test_connection()
result = BeamService.generate_masks(image_id)
status = BeamService.check_task_status(image_id)
```

### **MaskService**
```python
# Process and color masks
mask = MaskService.get_mask_at_point(image_id, x, y)
masks = MaskService.get_all_masks(image_id)
colored = MaskService.apply_color(image_id, mask_ids, color)
```

## 🧪 Testing

```bash
# Run comprehensive test suite
python test_api.py

# Test specific service
python -c "from service import BeamService; print(BeamService.test_connection())"
```

## � Configuration

Update Beam settings in `service.py`:

```python
BEAM_ENDPOINT_URL = "https://sam-segmentation-1c9e3c6-v2.app.beam.cloud"
BEAM_AUTH_TOKEN = "Bearer YOUR_TOKEN_HERE"
```

## 📝 Example Usage

```python
from service import ImageService, BeamService, MaskService

# 1. Store image
with open('building.jpg', 'rb') as f:
    image_id, result = ImageService.store_image(f.read())

# 2. Generate masks
masks_result = BeamService.generate_masks(image_id)

# 3. Select mask at point
mask = MaskService.get_mask_at_point(image_id, 200, 150)

# 4. Apply color
colored = MaskService.apply_color(image_id, [mask['mask']['id']], '#FF0000')
```

## � Production Notes

- **Storage**: Replace in-memory stores with database
- **Authentication**: Add auth middleware to `api.py`
- **Environment**: Move config to environment variables
- **Logging**: Add structured logging to services
- **Caching**: Add Redis for session/task management

## 🐛 Troubleshooting

- **Import Errors**: Ensure all files are in same directory
- **Beam Issues**: Check `/test-beam` endpoint
- **CORS Problems**: Update `allow_origins` in `api.py`
- **Memory Issues**: Clear data via `/clear-data/{image_id}`
# SAM2
