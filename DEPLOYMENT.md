# Deployment Guide

## Quick Start (Development)

### Option 1: Using the startup script (Windows)
```bash
# Double-click start.bat or run:
./start.bat
```

### Option 2: Manual start
```bash
# Terminal 1: Start Backend
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
python main.py

# Terminal 2: Start Frontend
cd frontend
npm install
npm start
```

## Production Deployment

### 1. Deploy SAM2 Model (Beam)
```bash
cd sam
beam deploy app.py:predict --name sam-segmentation
```
Note the endpoint URL for backend configuration.

### 2. Deploy Backend (Railway/Render/Heroku)
```bash
# Update BEAM_ENDPOINT_URL in backend/main.py
# Deploy backend folder to your cloud service
```

### 3. Deploy Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build folder or connect GitHub repo
```

## Environment Variables

### Backend
- `BEAM_ENDPOINT_URL`: Your deployed Beam SAM2 endpoint

### Frontend
- `REACT_APP_API_URL`: Your deployed backend URL

## Features Implemented

✅ Image upload (drag & drop)
✅ Mock mask generation (replace with Beam)
✅ Interactive mask selection
✅ Color palette and application
✅ Image download
✅ Responsive UI
✅ Error handling
✅ Loading states

## Next Steps

1. Deploy SAM2 model to Beam
2. Update backend with real Beam endpoint
3. Deploy to production
4. Add tests
5. Add CI/CD pipeline

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
