# SAM2 Image Segmentation Web Application

A web application that allows users to upload images of buildings, generate segmentation masks using the Segment Anything Model 2 (SAM2), and interactively color walls of buildings.

## Features

- 🖼️ **Image Upload**: Drag-and-drop or click to upload building images
- 🎯 **Mask Generation**: Generate segmentation masks using SAM2
- 🎨 **Interactive Coloring**: Click to select masks and apply colors
- 🖌️ **Multi-Selection**: Shift+click to combine multiple masks
- 📥 **Download**: Download the final colored image
- 👁️ **Mask Visualization**: Toggle to show/hide all generated masks

## Project Structure

```
sam2/
├── backend/           # FastAPI backend
│   ├── main.py       # Main API server
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── App.tsx   # Main React component
│   │   ├── index.tsx # Entry point
│   │   └── index.css # Styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tsconfig.json
├── sam/              # Beam deployment for SAM2
│   ├── app.py        # Beam endpoint
│   └── requirements.txt
└── requirements.txt  # Main dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Create and activate virtual environment**:
   ```bash
   cd sam2
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   # source venv/bin/activate    # On macOS/Linux
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

### SAM2 GPU Deployment (Beam)

1. **Install Beam CLI**:
   ```bash
   pip install beam-client
   ```

2. **Deploy the SAM2 endpoint**:
   ```bash
   cd sam
   beam deploy app.py:predict
   ```

3. **Update backend configuration**:
   - Get your Beam endpoint URL
   - Update the `beam_endpoint` variable in `backend/main.py`

## API Endpoints

### Backend API (`http://localhost:8000`)

- `POST /upload-image` - Upload an image file
- `POST /generate-masks/{image_id}` - Generate segmentation masks
- `GET /get-mask/{image_id}?x={x}&y={y}` - Get mask at specific point
- `POST /apply-color/{image_id}` - Apply color to selected masks

### SAM2 Endpoint (Beam)

- `POST /predict` - Generate masks using SAM2 model

## Usage

1. **Upload Image**: Click the upload area or drag-and-drop a building image
2. **Generate Masks**: Click "Generate Masks" to create segmentation masks
3. **Select Masks**: 
   - Click on the image to select a mask
   - Shift+click to add more masks to selection
   - Shift+right-click to remove masks from selection
4. **Choose Color**: Select a color from the palette
5. **Apply Color**: Click "Apply Color" to color the selected masks
6. **Download**: Click "Download Image" to save the result

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

### Backend
```
BEAM_ENDPOINT_URL=your-beam-endpoint-url
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your hosting service

### Backend (Railway/Render/AWS)
1. Deploy the `backend` folder to your cloud service
2. Set environment variables for Beam endpoint

### SAM2 (Beam)
1. Deploy using: `beam deploy sam/app.py:predict`
2. Note the endpoint URL for backend configuration

## Development

### Adding Features
- Backend: Add new endpoints in `backend/main.py`
- Frontend: Add new components in `frontend/src/`
- SAM2: Modify the model logic in `sam/app.py`

### Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure backend CORS is configured for frontend URL
2. **Module Not Found**: Ensure all dependencies are installed
3. **Beam Deployment**: Check Beam CLI authentication and quotas
4. **Image Upload Size**: Large images may need backend timeout adjustments

### Support

- Check the [Issues](https://github.com/your-repo/issues) page
- Review API documentation at `http://localhost:8000/docs`
- Verify all dependencies are correctly installed
# SAM2
