# MaskedCanvas Component

## Overview

The `MaskedCanvas` component renders selected masks from SAM2 segmentation results with customizable colors. It processes mask PNG data where pixel values determine mask membership (1 = part of mask, 0 = not part of mask).

## Features

- **Selective Rendering**: Only renders masks specified in `selectedMaskIds`
- **Custom Colors**: Each mask can have a custom color
- **Transparent Background**: Non-mask pixels are completely transparent
- **Pixel-Perfect**: Uses actual mask PNG data for accurate rendering

## Usage

```tsx
import MaskedCanvas from './components/MaskedCanvas/MaskedCanvas';

const App = () => {
  const [selectedMaskIds, setSelectedMaskIds] = useState([0, 2, 5]);
  const [masks, setMasks] = useState([]); // Array of MaskData from SAM2 API

  return (
    <MaskedCanvas
      base64Image="base64-encoded-image-data"
      masks={masks}
      selectedMaskIds={selectedMaskIds}
      width={800}
      height={600}
    />
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `base64Image` | `string` | Base64-encoded original image |
| `masks` | `MaskData[]` | Array of mask objects from SAM2 |
| `selectedMaskIds` | `number[]` | Array of mask IDs to render |
| `width` | `number` | Canvas width (optional, default: 800) |
| `height` | `number` | Canvas height (optional, default: 600) |

## MaskData Interface

```typescript
interface MaskData {
  id: number;
  mask_png: string; // base64 encoded PNG mask
  color?: string;   // hex color (e.g., "#ff0000")
  bbox?: number[];  // bounding box [x, y, width, height]
  score?: number;   // confidence score
}
```

## How It Works

1. **Mask Processing**: Each selected mask's PNG data is loaded as an image
2. **Pixel Analysis**: White pixels (value > 0) in the mask indicate mask membership
3. **Color Application**: Mask pixels are colored with the specified color
4. **Transparency**: Non-mask pixels remain transparent
5. **Composition**: All selected masks are rendered on the same canvas

## MaskSelector Component

A complete UI component that includes:
- Checkboxes to select/deselect masks
- Color pickers for each mask
- Live preview with MaskedCanvas
- Mask statistics display

```tsx
import MaskSelector from './components/MaskSelector/MaskSelector';

<MaskSelector
  base64Image={imageData}
  masks={masks}
  width={800}
  height={600}
/>
```

## Integration with SAM2 Backend

The component expects masks in the format returned by the SAM2 backend:

```json
{
  "image_id": "img_0",
  "masks": {
    "masks": [
      {
        "id": 0,
        "mask_png": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "bbox": [100, 150, 200, 250],
        "score": 0.95
      }
    ],
    "width": 800,
    "height": 600
  },
  "total_masks": 1,
  "status": "completed"
}
```

## Performance Considerations

- Masks are processed asynchronously to avoid blocking the UI
- Large images may take time to process - consider showing loading states
- Use `width` and `height` props to control canvas size for performance

## Error Handling

The component handles common errors:
- Invalid base64 data
- Missing mask PNG data
- Image loading failures

Errors are logged to console and the component continues with remaining masks.

## Utilities

### useMaskManagement Hook

Provides state management for mask selection and colors:

```tsx
const {
  masks,
  selectedMaskIds,
  maskColors,
  toggleMask,
  setMaskColor,
  selectAllMasks,
  clearSelection
} = useMaskManagement();
```

### Mask Utilities

Helper functions in `utils/maskUtils.ts`:
- `hexToRgb()`: Convert hex colors to RGB
- `generateRandomColor()`: Generate random colors for masks
- `assignColorsToMasks()`: Auto-assign colors to masks
- `isValidMask()`: Validate mask data structure
