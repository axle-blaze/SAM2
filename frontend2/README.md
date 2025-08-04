# SAM Image Masking Interface

A modern React application for interactive image segmentation using the Segment Anything Model (SAM). This interface allows users to upload images, generate masks automatically, and selectively render masks with custom colors.

## Features

- **Drag & Drop Image Upload**: Easy image uploading with preview
- **Automatic Mask Generation**: Leverages SAM2 API for intelligent segmentation
- **Interactive Mask Selection**: Grid-based mask selection with thumbnails
- **Color Customization**: RGBA color picker for each mask
- **Real-time Rendering**: Live preview of selected masks
- **Click-to-Find**: Click on images to find relevant masks
- **Batch Operations**: Select all, randomize colors, reset functions
- **Download Support**: Export rendered images

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd frontend2
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## API Integration

The application integrates with the SAM backend API running on `localhost:8000`. Make sure the backend server is running before using the frontend.

### Key API Endpoints:
- `POST /generate_and_store_masks` - Generate masks from image
- `GET /images/{id}/info` - Get image and mask details
- `POST /render_masks/{id}` - Render selected masks
- `GET /images/{id}/mask_at_point` - Find mask at coordinates

## Usage

1. **Upload Image**: Drag and drop or click to select an image file
2. **Wait for Processing**: The system generates masks automatically
3. **Select Masks**: Click on mask thumbnails to select/deselect
4. **Customize Colors**: Click color bars to open color picker
5. **View Results**: Switch between original and rendered views
6. **Download**: Export the final rendered image

## Project Structure

```
src/
├── components/          # React components
│   ├── ImageUploader.tsx    # File upload with drag/drop
│   ├── ImageDisplay.tsx     # Image viewer with tabs
│   ├── MaskGrid.tsx         # Mask selection grid
│   └── LoadingSpinner.tsx   # Loading indicator
├── services/           # API integration
│   └── api.ts              # API service methods
├── types/              # TypeScript interfaces
│   └── index.ts            # Type definitions
├── utils/              # Utility functions
│   └── helpers.ts          # Helper functions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles with Tailwind
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Modern JavaScript** - ES6+ features

## Configuration

The application uses a proxy configuration to connect to the backend API. Update `package.json` if your backend runs on a different port:

```json
{
  "proxy": "http://localhost:8000"
}
```

## Development

### Available Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

- ESLint configuration for code quality
- Tailwind CSS for consistent styling
- TypeScript for type safety
- Functional components with hooks

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design
