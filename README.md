# SAM2 Image Masking Web Application

A modern, full-stack web application for intelligent image segmentation using the Segment Anything Model 2 (SAM2). Upload images, generate masks automatically, and create stunning visualizations with interactive mask selection and custom coloring.

## 🌟 Features

- 🖼️ **Smart Image Upload**: Drag-and-drop interface with file validation and preview
- 🤖 **AI-Powered Segmentation**: Automatic mask generation using SAM2 API
- 🎨 **Interactive Mask Selection**: Grid-based selection with thumbnails and metadata
- 🖱️ **Click-to-Select**: Click directly on images to find relevant masks
- 🎭 **Custom Coloring**: RGBA color picker with transparency support
- �️ **Real-time Preview**: Live rendering of selected masks
- 💾 **Persistent Storage**: Save and manage multiple images and masks
- 📥 **Export Capabilities**: Download processed images in high quality
- � **Batch Operations**: Select all, randomize colors, and reset functions

## 📁 Project Structure

```
SAM2/
├── 📁 backend/                # FastAPI backend server
│   ├── main.py               # Main API server with all endpoints
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment configuration
│   ├── .env.example          # Environment template
│   ├── data.json            # Persistent image/mask storage
│   └── test_api.py          # API tests
├── 📁 frontend2/            # React + TypeScript frontend
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── services/        # API integration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   ├── .env.development    # Development config
│   ├── .env.production     # Production config
│   └── .env.example        # Environment template
├── 📁 sam/                  # SAM2 model deployment (legacy)
│   ├── app.py              # Beam deployment script
│   └── requirements.txt    # Model dependencies
├── docker-compose.yml      # Docker orchestration
├── Dockerfile             # Container configuration
├── requirements.txt       # Root dependencies
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** for version control

### 1. Clone and Setup

```bash
git clone <repository-url>
cd SAM2
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your SAM API credentials

# Start the server
python main.py
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend2

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env if needed (default: http://localhost:8000)

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Production Build

```bash
# Frontend production build
cd frontend2
npm run build

# Backend with production settings
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🔌 API Reference

### Backend API (`http://localhost:8000`)

#### Core Endpoints
- `POST /generate_and_store_masks` - Generate and store masks from uploaded image
- `POST /render_masks/{image_id}` - Render selected masks with colors
- `GET /images/{image_id}/info` - Get image details and available masks
- `GET /images/{image_id}/mask_at_point?x={x}&y={y}` - Find mask at coordinates
- `GET /images` - List all stored images
- `DELETE /images/{image_id}` - Delete image and associated masks

#### Request/Response Examples

**Generate Masks:**
```bash
curl -X POST "http://localhost:8000/generate_and_store_masks" \
  -H "Content-Type: application/json" \
  -d '{"original_image_b64": "data:image/png;base64,..."}'
```

**Render Masks:**
```bash
curl -X POST "http://localhost:8000/render_masks/image_123" \
  -H "Content-Type: application/json" \
  -d '{
    "render_instructions": [
      {"mask_id": 1, "color": [255, 0, 0, 128]},
      {"mask_id": 2, "color": [0, 255, 0, 255]}
    ]
  }'
```

### External SAM2 API Integration

The backend integrates with external SAM2 segmentation services. Configure the API endpoint and authentication in your `.env` file.

## 🖥️ Usage Guide

### Basic Workflow

1. **Upload Image**
   - Drag and drop an image file onto the upload area
   - Or click to browse and select a file
   - Supported formats: PNG, JPG, JPEG, WebP

2. **Automatic Processing**
   - The system automatically generates segmentation masks
   - Processing time varies based on image complexity
   - View progress in the loading indicators

3. **Select Masks**
   - Browse masks in the grid view with thumbnails
   - Click individual masks to select/deselect
   - Use "Select All" for batch operations
   - Click directly on the image to find relevant masks

4. **Customize Colors**
   - Click on color bars to open the color picker
   - Adjust RGBA values for transparency effects
   - Use "Random Colors" for quick styling
   - "Reset Colors" to clear all selections

5. **Preview and Export**
   - Switch between "Original" and "Rendered" views
   - Preview your selections in real-time
   - Download the final rendered image

### Advanced Features

- **Image Management**: Access previously uploaded images via dropdown
- **Mask Search**: Click on image areas to find corresponding masks
- **Batch Operations**: Select all masks, randomize colors, or reset
- **Quality Controls**: High-resolution output with transparency support

## ⚙️ Environment Configuration

### Backend Configuration (`.env`)

```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0

# Database Configuration
JSON_DB_PATH=/path/to/your/data.json

# External SAM API Configuration (REQUIRED)
SAM_API_URL=https://your-sam-api-endpoint.com
SAM_API_TOKEN=your_api_token_here
SAM_API_TIMEOUT=150

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Application Metadata
APP_TITLE=SAM Image Masking API
APP_DESCRIPTION=API to generate masks using external SAM service
APP_VERSION=1.0.0
```

### Frontend Configuration (`.env`)

```bash
# Development Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development

# Build Configuration
GENERATE_SOURCEMAP=false
FAST_REFRESH=true

# Development Server
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### Production Configuration

For production deployments, create separate `.env.production` files with:
- Secure API endpoints (HTTPS)
- Production database paths
- Restricted CORS origins
- Optimized build settings

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t sam2-app .

# Run the container
docker run -p 8000:8000 -p 3000:3000 sam2-app
```

## ☁️ Cloud Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend2
npm run build
# Deploy the build/ folder
```

### Backend (Railway/Render/AWS)
```bash
cd backend
# Deploy with your cloud provider
# Set environment variables in provider dashboard
```

### Environment Variables for Production
- Set all required environment variables in your cloud provider
- Use secure API endpoints (HTTPS)
- Configure proper CORS origins
- Set up monitoring and logging

## 🛠️ Development

### Architecture Overview

- **Backend**: FastAPI with async support and automatic OpenAPI docs
- **Frontend**: React 18 with TypeScript and Tailwind CSS
- **Storage**: JSON-based persistence with configurable database path
- **API Integration**: RESTful design with proper error handling
- **Styling**: Modern UI with responsive design and accessibility

### Code Organization

- **Modular Components**: Reusable React components with TypeScript
- **Service Layer**: Centralized API communication
- **Custom Hooks**: Shared React logic (confirmation dialogs, local storage)
- **Type Safety**: Full TypeScript coverage for better development experience
- **Error Handling**: Comprehensive error boundaries and user feedback

### Adding Features

1. **Backend Endpoints**: Add new routes in `backend/main.py`
2. **Frontend Components**: Create components in `frontend2/src/components/`
3. **API Integration**: Update `frontend2/src/services/api.ts`
4. **Types**: Define interfaces in `frontend2/src/types/index.ts`

### Testing

```bash
# Backend testing
cd backend
pip install pytest
python -m pytest test_api.py

# Frontend testing
cd frontend2
npm test

# End-to-end testing
npm run test:e2e
```

## 🧪 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow the configured rules
- **Prettier**: Use for code formatting
- **Tailwind**: Use utility-first CSS approach
- **Testing**: Add tests for new functionality

### Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed
- Keep commits focused and atomic

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**CORS Errors**
```bash
# Check backend CORS configuration
# Ensure frontend URL is in CORS_ORIGINS
```

**API Connection Failed**
```bash
# Verify backend is running on correct port
# Check REACT_APP_API_BASE_URL in frontend .env
```

**Module Not Found**
```bash
# Reinstall dependencies
cd backend && pip install -r requirements.txt
cd frontend2 && npm install
```

**Image Upload Issues**
```bash
# Check file size limits
# Verify supported image formats
# Ensure proper base64 encoding
```

### Getting Help

- 📚 **Documentation**: Check `/docs` endpoint for API documentation
- 🐛 **Issues**: Report bugs in the GitHub Issues section
- 💬 **Discussions**: Join community discussions
- 📧 **Support**: Contact the development team

### Performance Tips

- **Image Size**: Optimize images before upload for faster processing
- **Browser**: Use modern browsers for best performance
- **Network**: Ensure stable internet for API calls
- **Memory**: Close unused browser tabs during processing

---

**Made with ❤️ using React, FastAPI, and SAM2**
