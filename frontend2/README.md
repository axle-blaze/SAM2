# SAM2 Frontend Interface

A modern React application with TypeScript and Tailwind CSS for interactive image segmentation using the Segment Anything Model (SAM2). This interface provides an intuitive way to upload images, generate masks automatically, and create stunning visualizations with selective mask rendering.

## 🌟 Features

- **🎨 Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **📁 Drag & Drop Upload**: Intuitive file uploading with preview
- **🤖 Smart Mask Generation**: Automatic segmentation via SAM2 API
- **🖱️ Interactive Selection**: Grid-based mask selection with thumbnails
- **🎭 Color Customization**: RGBA color picker with transparency
- **🖼️ Real-time Preview**: Live rendering of selected masks
- **🎯 Click-to-Find**: Click on images to find relevant masks
- **⚡ Batch Operations**: Select all, randomize colors, reset functions
- **💾 Image Management**: Access and manage previously uploaded images
- **📥 Export Support**: Download high-quality rendered images
- **🔄 State Persistence**: Local storage for user preferences

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** with npm
- **Backend API** running on configured port (default: 8000)

### 1. Installation

```bash
cd frontend2

# Install dependencies
npm install

# Setup environment (optional)
cp .env.example .env
```

### 2. Development

```bash
# Start development server
npm start

# Open browser (auto-opens to http://localhost:3000)
```

### 3. Production Build

```bash
# Create optimized build
npm run build

# Serve locally for testing
npx serve -s build -l 3000
```

### 4. Testing

```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## ⚙️ Configuration

### Environment Variables

The application supports multiple environment files for different deployment scenarios:

#### `.env.development` (Development)
```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development

# Development Features
DANGEROUSLY_DISABLE_HOST_CHECK=true
FAST_REFRESH=true
GENERATE_SOURCEMAP=false
```

#### `.env.production` (Production)
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://your-production-api.com
REACT_APP_ENV=production

# Production Optimizations
GENERATE_SOURCEMAP=false
REACT_APP_DEV_TOOLS=false
```

#### `.env.local` (Local Overrides)
```bash
# Local development overrides
REACT_APP_API_BASE_URL=http://192.168.1.100:8000
```

### Build Configuration

#### `package.json` Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

#### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  },
  plugins: []
}
```

## 🖥️ Usage Guide

### Basic Workflow

1. **📤 Upload Image**
   ```
   • Drag and drop image files (PNG, JPG, JPEG, WebP)
   • Click upload area to browse files
   • Automatic format validation and preview
   • Progress indicators during upload
   ```

2. **⚡ Automatic Processing**
   ```
   • System generates segmentation masks
   • Real-time progress feedback
   • Error handling for failed processing
   • Automatic transition to selection view
   ```

3. **🎯 Mask Selection**
   ```
   • Browse masks in organized grid layout
   • Click individual masks to select/deselect
   • View mask metadata (area, bounding box)
   • Thumbnail previews for easy identification
   ```

4. **🎨 Color Customization**
   ```
   • Click color bars to open RGBA picker
   • Adjust transparency with alpha channel
   • Use "Random Colors" for quick styling
   • "Reset Colors" to clear all selections
   ```

5. **👁️ Preview & Export**
   ```
   • Toggle between "Original" and "Rendered" views
   • Real-time preview of color applications
   • High-quality image download
   • Maintain aspect ratio and resolution
   ```

### Advanced Features

#### 🖱️ Click-to-Find Masks
- Click anywhere on the uploaded image
- System identifies relevant masks at that location
- Automatic selection and highlighting
- Useful for precise mask targeting

#### 📋 Batch Operations
- **Select All**: Choose all available masks
- **Random Colors**: Apply random colors to selected masks
- **Reset**: Clear all selections and colors
- **Bulk Export**: Process multiple mask combinations

#### 💾 Image Management
- Access previously uploaded images via dropdown
- View image metadata (dimensions, mask count, date)
- Delete old images to manage storage
- Persistent storage across browser sessions

## 📁 Project Structure

```
frontend2/
├── 📁 public/                    # Static assets
│   ├── index.html               # HTML template
│   ├── favicon.ico              # App icon
│   └── manifest.json            # PWA manifest
├── 📁 src/                      # Source code
│   ├── 📁 components/           # React components
│   │   ├── Canvas/              # Interactive canvas component
│   │   │   └── InteractiveCanvas.tsx
│   │   ├── ColorPicker/         # RGBA color picker
│   │   │   └── ColorPicker.tsx
│   │   ├── ImageUpload/         # File upload component
│   │   │   └── ImageUpload.tsx
│   │   ├── LoadingSpinner/      # Loading indicators
│   │   │   └── LoadingSpinner.tsx
│   │   ├── MaskOverlay/         # Mask visualization
│   │   │   └── MaskOverlay.tsx
│   │   ├── ToolPanel/           # Control panel
│   │   │   └── ToolPanel.tsx
│   │   └── ImageSelector/       # Image management
│   │       └── ImageSelector.tsx
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── useImageSegmentation.ts  # Main segmentation logic
│   │   ├── useLocalStorage.ts      # Persistent storage
│   │   └── useConfirmation.tsx     # Confirmation dialogs
│   ├── 📁 services/            # API integration
│   │   └── sam2Api.ts              # Backend API service
│   ├── 📁 styles/              # CSS and styling
│   │   ├── globals.css             # Global styles
│   │   └── variables.css           # CSS variables
│   ├── 📁 types/               # TypeScript definitions
│   │   └── index.ts                # Type interfaces
│   ├── 📁 utils/               # Utility functions
│   │   ├── imageUtils.ts           # Image processing
│   │   └── maskUtils.ts            # Mask manipulation
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # App-specific styles
│   └── index.tsx               # Application entry point
├── 📁 build/                   # Production build (generated)
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── .env.development           # Development environment
├── .env.production            # Production environment
├── .env.example               # Environment template
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Core Technologies
- **⚛️ React 18**: Modern React with hooks and functional components
- **📘 TypeScript**: Type safety and enhanced developer experience
- **🎨 Tailwind CSS**: Utility-first CSS framework for rapid styling
- **🏗️ Create React App**: Zero-configuration build setup

### Key Libraries
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^4.9.5",
  "tailwindcss": "^3.3.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0"
}
```

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

### Browser APIs Used
- **File API**: File upload and reading
- **Canvas API**: Image manipulation and rendering
- **Local Storage**: State persistence
- **Fetch API**: HTTP requests to backend

## 🔌 API Integration

### Service Architecture

The frontend communicates with the backend through a centralized API service:

```typescript
// src/services/api.ts
class ApiService {
  private baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  async generateAndStoreMasks(imageBase64: string): Promise<GenerateMasksResponse>
  async renderMasks(imageId: string, instructions: RenderInstruction[]): Promise<RenderResponse>
  async getImageInfo(imageId: string): Promise<ImageInfo>
  async getMaskAtPoint(imageId: string, x: number, y: number): Promise<MaskAtPointResponse>
  async listImages(): Promise<ListImagesResponse>
  async deleteImage(imageId: string): Promise<void>
}
```

### Key API Endpoints

#### **Mask Generation**
```typescript
POST /generate_and_store_masks
{
  "original_image_b64": "data:image/png;base64,..."
}
```

#### **Mask Rendering**
```typescript
POST /render_masks/{imageId}
{
  "render_instructions": [
    {"mask_id": 1, "color": [255, 0, 0, 128]},
    {"mask_id": 2, "color": [0, 255, 0, 255]}
  ]
}
```

#### **Image Information**
```typescript
GET /images/{imageId}/info
// Returns: image details, dimensions, available masks
```

#### **Point-based Mask Finding**
```typescript
GET /images/{imageId}/mask_at_point?x=150&y=200
// Returns: mask ID at specified coordinates
```

### Error Handling

```typescript
// Comprehensive error handling with user feedback
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  throw new Error(error.message || 'Unknown error occurred');
}
```

## 🧩 Component Architecture

### Core Components

#### **App.tsx** - Main Application
```typescript
// Central state management and routing
const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [selectedMasks, setSelectedMasks] = useState<Set<number>>(new Set());
  
  // Main application logic
};
```

#### **ImageUpload/ImageUpload.tsx** - File Upload
```typescript
// Drag-and-drop file upload with validation
interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isUploading: boolean;
  className?: string;
}
```

#### **Canvas/InteractiveCanvas.tsx** - Image Display
```typescript
// Interactive image canvas with click-to-find functionality
interface InteractiveCanvasProps {
  imageData: string;
  onPointClick: (x: number, y: number) => void;
  overlayMasks?: Mask[];
}
```

#### **MaskOverlay/MaskOverlay.tsx** - Mask Grid
```typescript
// Grid-based mask selection with thumbnails
interface MaskOverlayProps {
  masks: Mask[];
  selectedMasks: Set<number>;
  onMaskToggle: (maskId: number) => void;
  onColorChange: (maskId: number, color: RGBA) => void;
}
```

#### **ColorPicker/ColorPicker.tsx** - Color Selection
```typescript
// RGBA color picker with transparency support
interface ColorPickerProps {
  color: RGBA;
  onChange: (color: RGBA) => void;
  onClose: () => void;
}
```

### Custom Hooks

#### **useImageSegmentation.ts** - Main Logic
```typescript
export const useImageSegmentation = () => {
  const [state, setState] = useState<SegmentationState>({
    currentImage: null,
    masks: [],
    selectedMasks: new Set(),
    isLoading: false,
    error: null
  });

  const uploadImage = async (file: File) => { /* ... */ };
  const selectMask = (maskId: number) => { /* ... */ };
  const renderSelectedMasks = async () => { /* ... */ };
  
  return { state, uploadImage, selectMask, renderSelectedMasks };
};
```

#### **useLocalStorage.ts** - Persistence
```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => { /* ... */ };
  
  return [storedValue, setValue] as const;
};
```

#### **useConfirmation.tsx** - Dialog Management
```typescript
export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  
  const showConfirmation = (message: string, onConfirm: () => void) => { /* ... */ };
  const ConfirmationModal = () => { /* ... */ };
  
  return { showConfirmation, ConfirmationModal };
};
```
