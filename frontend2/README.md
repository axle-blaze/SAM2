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

## 🧪 Development & Testing

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run build          # Create production build
npm test              # Run test suite
npm test -- --coverage # Run tests with coverage
npm run lint          # Check code quality
npm run lint:fix      # Fix linting issues
npm run type-check    # TypeScript type checking

# Advanced
npm run eject         # Eject from Create React App (irreversible)
npm run analyze       # Bundle size analysis
```

### Code Quality Standards

#### **ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### **TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### Testing Strategy

#### **Unit Tests**
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../ImageUpload/ImageUpload';

test('handles file upload', () => {
  const mockOnUpload = jest.fn();
  render(<ImageUpload onImageUpload={mockOnUpload} isUploading={false} />);
  
  const input = screen.getByRole('button');
  const file = new File(['test'], 'test.png', { type: 'image/png' });
  
  fireEvent.change(input, { target: { files: [file] } });
  expect(mockOnUpload).toHaveBeenCalledWith(file);
});
```

#### **Integration Tests**
```typescript
// API integration test
import { ApiService } from '../services/api';

test('generates masks successfully', async () => {
  const api = new ApiService();
  const mockResponse = { mask_count: 5, image_id: 'test_123' };
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  ) as jest.Mock;

  const result = await api.generateAndStoreMasks('base64data');
  expect(result.mask_count).toBe(5);
});
```

### Performance Optimization

#### **Code Splitting**
```typescript
// Lazy loading for better performance
const ColorPicker = React.lazy(() => import('./ColorPicker/ColorPicker'));
const MaskOverlay = React.lazy(() => import('./MaskOverlay/MaskOverlay'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ColorPicker color={color} onChange={handleColorChange} />
</Suspense>
```

#### **Memory Management**
```typescript
// Cleanup effects to prevent memory leaks
useEffect(() => {
  const handleResize = () => setWindowSize(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### **Image Optimization**
```typescript
// Efficient image handling
const processImage = useCallback((file: File) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Resize if too large
  if (file.size > MAX_FILE_SIZE) {
    canvas.width = Math.min(image.width, MAX_WIDTH);
    canvas.height = Math.min(image.height, MAX_HEIGHT);
    ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
  }
}, []);
```

## 🚀 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### Environment-Specific Builds

#### **Development**
```bash
# Use development environment
npm start
# Uses .env.development automatically
```

#### **Production**
```bash
# Build with production config
npm run build
# Uses .env.production automatically
```

#### **Staging**
```bash
# Custom environment
REACT_APP_ENV=staging npm run build
```

### Deployment Platforms

#### **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables in Vercel dashboard:
# REACT_APP_API_BASE_URL=https://your-api.com
```

#### **Netlify**
```bash
# Build and deploy
npm run build
# Upload build/ folder to Netlify
# Set environment variables in Netlify dashboard
```

#### **AWS S3 + CloudFront**
```bash
# Build application
npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### **GitHub Pages**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/your-repo",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

## 🎨 Customization

### Theming with Tailwind

#### **Custom Colors**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        accent: '#10b981',
      }
    }
  }
}
```

#### **Component Styling**
```typescript
// Use CSS modules or styled-components for complex styling
const StyledButton = styled.button`
  ${tw`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
  transition: all 0.2s ease-in-out;
`;
```

### Adding New Features

#### **New Component Checklist**
1. Create component with TypeScript interface
2. Add comprehensive prop types
3. Implement error boundaries
4. Add unit tests
5. Update documentation
6. Add to Storybook (if applicable)

#### **State Management Extensions**
```typescript
// Extend the main state interface
interface AppState {
  // Existing state
  currentImage: string | null;
  masks: Mask[];
  selectedMasks: Set<number>;
  
  // New features
  favorites: string[];
  recentColors: RGBA[];
  userPreferences: UserPreferences;
}
```

## 🔧 Troubleshooting

### Common Issues

#### **Build Failures**
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### **API Connection Issues**
```typescript
// Check environment variables
console.log('API URL:', process.env.REACT_APP_API_BASE_URL);

// Test API connectivity
fetch(`${process.env.REACT_APP_API_BASE_URL}/images`)
  .then(response => console.log('API Status:', response.status))
  .catch(error => console.error('API Error:', error));
```

#### **Performance Issues**
```typescript
// Use React DevTools Profiler
// Identify unnecessary re-renders with useMemo and useCallback

const expensiveComputation = useMemo(() => {
  return masks.map(mask => processMaxData(mask));
}, [masks]);

const stableCallback = useCallback((maskId: number) => {
  setSelectedMasks(prev => new Set(prev).add(maskId));
}, []);
```

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES2018, CSS Grid, Flexbox, Canvas API, File API

### Debugging Tools

```typescript
// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  
  // Debug API calls
  window.debugAPI = ApiService;
  
  // Performance monitoring
  console.time('Component Render');
}
```

---

**Built with React, TypeScript, Tailwind CSS, and ❤️**
