# SAM2 React App

This project is a React application that implements the Segment Anything Model 2 (SAM2) for image segmentation. It provides an interactive wall painting functionality, allowing users to upload images, generate segmentation masks, and apply colors to the segmented areas.

## Project Structure

The project is organized as follows:

```
sam2-react-app
├── public
│   ├── index.html          # Main HTML document
│   └── favicon.ico         # Favicon for the application
├── src
│   ├── components          # React components for the application
│   │   ├── ImageUpload     # Component for image uploads
│   │   ├── Canvas          # Interactive canvas for displaying images and masks
│   │   ├── MaskOverlay     # Component for displaying mask overlays
│   │   ├── ColorPicker     # Component for selecting colors
│   │   ├── ToolPanel       # Component for tool options
│   │   └── LoadingSpinner   # Component for loading state
│   ├── hooks               # Custom hooks for managing state and logic
│   ├── services            # API service layer for backend communication
│   ├── types               # TypeScript types for the application
│   ├── utils               # Utility functions for various operations
│   ├── styles              # Global and component-specific styles
│   ├── App.tsx             # Main application component
│   ├── App.css             # Styles for the App component
│   └── index.tsx           # Entry point of the application
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Getting Started

To get started with the SAM2 React App, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sam2-react-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Features

- **Image Upload:** Users can upload images using a drag-and-drop interface.
- **Interactive Canvas:** The application provides an interactive canvas for displaying images and segmentation masks.
- **Mask Generation:** Users can generate segmentation masks using the SAM2 model.
- **Color Picker:** A color palette allows users to select colors to apply to segmented areas.
- **Tool Panel:** Includes buttons for generating masks, toggling visibility, resetting the canvas, and downloading the final image.
- **Loading Spinner:** Displays a loading spinner during API calls or processing.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.