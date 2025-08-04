# SAM2 Backend API

A FastAPI-based backend service for the SAM2 Image Masking application. This service handles image processing, mask generation through external SAM2 API integration, and provides a RESTful API for the frontend interface.

## 🚀 Features

- **RESTful API**: Clean, documented endpoints with OpenAPI/Swagger support
- **External SAM2 Integration**: Seamless connection to SAM2 segmentation services
- **Image Management**: Store, retrieve, and manage images with persistent storage
- **Mask Processing**: Generate, select, and render masks with custom colors
- **Real-time Rendering**: Process mask combinations with transparency support
- **CORS Support**: Configurable cross-origin resource sharing
- **Environment Configuration**: Flexible setup with environment variables
- **Error Handling**: Comprehensive error responses and logging

## 📋 Requirements

- **Python 3.8+**
- **pip** package manager
- **External SAM2 API** access (configured via environment variables)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd SAM2/backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Server Configuration
PORT=8000                    # Server port
HOST=0.0.0.0                # Server host (0.0.0.0 for all interfaces)

# Database Configuration
JSON_DB_PATH=/path/to/data.json  # Path to JSON database file

# External SAM API Configuration (REQUIRED)
SAM_API_URL=https://your-sam-api-endpoint.com
SAM_API_TOKEN=your_api_token_here
SAM_API_TIMEOUT=150          # Request timeout in seconds

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Application Metadata
APP_TITLE=SAM Image Masking API
APP_DESCRIPTION=API to generate masks using external SAM service
APP_VERSION=1.0.0
```

### Required Configuration

**SAM_API_URL** and **SAM_API_TOKEN** are required for the external SAM2 integration. Obtain these from your SAM2 service provider.

## 🚦 Running the Server

### Development Mode

```bash
# Standard run
python main.py

# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Single worker
uvicorn main:app --host 0.0.0.0 --port 8000

# Multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

The server will start at `http://localhost:8000`
API documentation available at `http://localhost:8000/docs`

## 📡 API Endpoints

### Core Image Operations

#### Generate and Store Masks
```http
POST /generate_and_store_masks
Content-Type: application/json

{
  "original_image_b64": "data:image/png;base64,..."
}
```

**Optional Query Parameter:**
- `image_id`: Custom ID (auto-generated if not provided)

**Response:**
```json
{
  "message": "Masks generated and stored successfully",
  "image_id": "img_20250804_123456_abc12345",
  "mask_count": 15,
  "image_dimensions": {"width": 1024, "height": 768},
  "mask_ids": [1, 2, 3, ...]
}
```

#### Render Selected Masks
```http
POST /render_masks/{image_id}
Content-Type: application/json

{
  "render_instructions": [
    {"mask_id": 1, "color": [255, 0, 0, 128]},
    {"mask_id": 3, "color": [0, 255, 0, 255]},
    {"mask_id": 5, "color": null}
  ]
}
```

**Response:**
```json
{
  "message": "Image rendered successfully",
  "rendered_image_b64": "iVBORw0KGgoAAAANS..."
}
```

### Image Management

#### Get Image Information
```http
GET /images/{image_id}/info
```

**Response:**
```json
{
  "image_id": "img_20250804_123456",
  "width": 1024,
  "height": 768,
  "created_at": "2025-08-04T12:34:56",
  "original_image_b64": "data:image/png;base64,...",
  "available_masks": [
    {
      "id": 1,
      "area": 5432,
      "bbox": [100, 150, 300, 250],
      "mask_b64": "iVBORw0KGgo..."
    }
  ]
}
```

#### List All Images
```http
GET /images
```

#### Find Mask at Point
```http
GET /images/{image_id}/mask_at_point?x=150&y=200
```

#### Delete Image
```http
DELETE /images/{image_id}
```

## 🏗️ Architecture

### Data Flow

1. **Image Upload**: Frontend sends base64-encoded image
2. **External Processing**: Image sent to SAM2 API for segmentation
3. **Storage**: Image and masks stored in JSON database
4. **Mask Selection**: Frontend selects masks for rendering
5. **Rendering**: Selected masks combined with custom colors
6. **Response**: Processed image returned to frontend

### File Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment configuration
├── .env.example         # Environment template
├── data.json           # Persistent storage (auto-created)
├── test_api.py         # API tests
└── README.md           # This file
```

### Dependencies

```txt
fastapi>=0.104.1        # Web framework
uvicorn>=0.24.0         # ASGI server
python-dotenv>=1.0.0    # Environment variables
requests>=2.31.0        # HTTP client
Pillow>=10.1.0          # Image processing
pydantic>=2.5.0         # Data validation
python-multipart>=0.0.6 # File uploads
```

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
python -m pytest test_api.py -v

# Run with coverage
pip install pytest-cov
pytest --cov=main test_api.py
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/docs

# List images
curl http://localhost:8000/images

# Test with sample image
curl -X POST "http://localhost:8000/generate_and_store_masks" \
  -H "Content-Type: application/json" \
  -d '{"original_image_b64": "data:image/png;base64,iVBORw0KGgo..."}'
```

## 🐳 Docker Support

### Build Docker Image

```bash
# From project root
docker build -t sam2-backend .

# Run container
docker run -p 8000:8000 --env-file backend/.env sam2-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./data:/app/data
```

## 🔧 Development

### Code Style

```bash
# Install development tools
pip install black flake8 mypy

# Format code
black main.py

# Lint code
flake8 main.py

# Type checking
mypy main.py
```

### Adding New Endpoints

1. Define Pydantic models for request/response
2. Add endpoint function with proper decorators
3. Include comprehensive error handling
4. Update API documentation
5. Add corresponding tests

### Database Operations

The application uses a simple JSON file for persistence:

```python
# Load database
db = load_db()

# Modify data
db[image_id] = {...}

# Save changes
save_db(db)
```

## 🚨 Error Handling

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (invalid input)
- **404**: Not Found (image/mask not found)
- **422**: Validation Error (Pydantic validation)
- **500**: Internal Server Error
- **502**: Bad Gateway (external API error)

### Error Response Format

```json
{
  "detail": "Error message description"
}
```

## 📊 Monitoring

### Logging

```python
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use in endpoints
logger.info(f"Processing image {image_id}")
```

### Health Checks

```bash
# Basic health check
curl http://localhost:8000/docs

# Database status
curl http://localhost:8000/images
```

## 🔒 Security

### Environment Variables

- Store sensitive data in `.env` file
- Never commit `.env` to version control
- Use strong API tokens
- Restrict CORS origins in production

### Input Validation

- All inputs validated with Pydantic models
- File size limits enforced
- Image format validation
- SQL injection prevention (no SQL used)

## 🚀 Deployment

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure secure API endpoints (HTTPS)
- [ ] Set restrictive CORS origins
- [ ] Enable proper logging
- [ ] Set up monitoring
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure backup for data.json

### Cloud Deployment

**Railway:**
```bash
railway login
railway init
railway add
railway deploy
```

**Render:**
- Connect GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**AWS/Google Cloud:**
- Use container deployment with Dockerfile
- Set environment variables in cloud console
- Configure load balancer and auto-scaling

## 📞 Support

### Troubleshooting

**Server won't start:**
- Check Python version (3.8+)
- Verify all dependencies installed
- Check port availability
- Review environment variables

**External API errors:**
- Verify SAM_API_URL and SAM_API_TOKEN
- Check network connectivity
- Review API rate limits
- Examine API response format

**CORS issues:**
- Update CORS_ORIGINS in .env
- Check frontend URL format
- Verify protocol (http/https)

### Getting Help

- Check API documentation: `http://localhost:8000/docs`
- Review error logs in console
- Test with curl commands
- Verify environment configuration

---

**Built with FastAPI, Python, and ❤️**
