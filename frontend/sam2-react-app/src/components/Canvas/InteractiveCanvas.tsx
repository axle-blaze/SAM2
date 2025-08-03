import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import { MaskData, ImageData } from '../../types';

interface InteractiveCanvasProps {
  image: ImageData | null;
  masks: MaskData[];
  onMaskClick: (maskId: string, addToSelection?: boolean, removeFromSelection?: boolean) => void;
  showAllMasks: boolean;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
  image, 
  masks, 
  onMaskClick,
  showAllMasks 
}) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
  const [maskImages, setMaskImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const [maskCanvases, setMaskCanvases] = useState<{ [key: string]: HTMLCanvasElement }>({});
  const stageRef = useRef<any>(null);

  // Load main image
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.onload = () => setKonvaImage(img);
    img.src = image.src;
  }, [image]);

  // Load mask images and create canvases for pixel detection
  useEffect(() => {
    const loadMasks = async () => {
      const maskImageMap: { [key: string]: HTMLImageElement } = {};
      const maskCanvasMap: { [key: string]: HTMLCanvasElement } = {};
      
      for (const mask of masks) {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            // Create canvas for pixel detection
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            maskCanvasMap[mask.id] = canvas;
            resolve(img);
          };
          img.src = `data:image/png;base64,${mask.mask}`;
        });
        maskImageMap[mask.id] = img;
      }
      
      setMaskImages(maskImageMap);
      setMaskCanvases(maskCanvasMap);
    };
    
    if (masks.length > 0) {
      loadMasks();
    }
  }, [masks]);

  const getClickedMask = (x: number, y: number): string | null => {
    // Convert click coordinates to image coordinates
    const imageX = Math.floor((x / 800) * (konvaImage?.width || 800));
    const imageY = Math.floor((y / 600) * (konvaImage?.height || 600));
    
    // Check masks in reverse order (top to bottom)
    for (let i = masks.length - 1; i >= 0; i--) {
      const mask = masks[i];
      const canvas = maskCanvases[mask.id];
      if (!canvas) continue;
      
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.getImageData(
        Math.max(0, Math.min(imageX, canvas.width - 1)),
        Math.max(0, Math.min(imageY, canvas.height - 1)),
        1, 1
      );
      
      // Check if the pixel is not transparent (alpha > 0)
      if (imageData.data[3] > 0) {
        return mask.id;
      }
    }
    
    return null;
  };

  const handleStageClick = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    
    const clickedMaskId = getClickedMask(pos.x, pos.y);
    if (!clickedMaskId) return;
    
    const isShiftPressed = e.evt.shiftKey;
    const isRightClick = e.evt.button === 2;
    
    if (isShiftPressed && isRightClick) {
      // Shift + Right Click: Remove from selection
      onMaskClick(clickedMaskId, false, true);
    } else if (isShiftPressed) {
      // Shift + Click: Add to selection
      onMaskClick(clickedMaskId, true, false);
    } else {
      // Regular click: Toggle selection
      onMaskClick(clickedMaskId, false, false);
    }
  };

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault(); // Prevent browser context menu
  };

  if (!image || !konvaImage) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image loaded</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <Stage
        ref={stageRef}
        width={800}
        height={600}
        onClick={handleStageClick}
        onContextMenu={handleContextMenu}
      >
        <Layer>
          {/* Main Image */}
          <KonvaImage
            image={konvaImage}
            width={800}
            height={600}
          />
          
          {/* Mask Overlays */}
          {masks.map(mask => {
            const maskImg = maskImages[mask.id];
            if (!maskImg) return null;
            
            // Show mask if: it's selected OR showAllMasks is true
            const shouldShowMask = mask.selected || showAllMasks;
            
            if (!shouldShowMask) return null;
            
            return (
              <React.Fragment key={mask.id}>
                {mask.selected && mask.color && (
                  <KonvaImage
                    image={maskImg}
                    width={800}
                    height={600}
                    opacity={0.6}
                    globalCompositeOperation="source-atop"
                    filters={[]}
                    fill={mask.color}
                  />
                )}
                <KonvaImage
                  image={maskImg}
                  width={800}
                  height={600}
                  opacity={mask.selected ? 0.8 : (showAllMasks ? 0.3 : 0)}
                  listening={false}
                />
                {mask.selected && (
                  <Rect
                    x={0}
                    y={0}
                    width={800}
                    height={600}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    opacity={0.8}
                    listening={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
      
      {/* Instructions */}
      <div className="p-3 bg-gray-50 text-xs text-gray-600">
        <p><strong>Click:</strong> Select/deselect mask | <strong>Shift+Click:</strong> Add to selection | <strong>Shift+Right-Click:</strong> Remove from selection</p>
      </div>
      
      {/* Mask Grid */}
      {masks.length > 0 && (
        <div className="p-4 bg-gray-50 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">All Masks ({masks.length})</h3>
          <div className="grid grid-cols-4 gap-3">
            {masks.map((mask, index) => {
              const maskImg = maskImages[mask.id];
              if (!maskImg) return null;
              
              return (
                <div
                  key={mask.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    mask.selected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onMaskClick(mask.id, false, false)}
                >
                  {/* Mask Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    <canvas
                      ref={(canvas) => {
                        if (canvas && maskImg) {
                          const ctx = canvas.getContext('2d')!;
                          canvas.width = 120;
                          canvas.height = 120;
                          
                          // Draw base image if available
                          if (konvaImage) {
                            ctx.drawImage(konvaImage, 0, 0, 120, 120);
                          } else {
                            ctx.fillStyle = '#f3f4f6';
                            ctx.fillRect(0, 0, 120, 120);
                          }
                          
                          // Draw mask overlay
                          ctx.globalAlpha = 0.7;
                          if (mask.color) {
                            // Apply color to mask
                            ctx.globalCompositeOperation = 'source-over';
                            ctx.fillStyle = mask.color;
                            
                            // Create a temporary canvas for the colored mask
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = maskImg.width;
                            tempCanvas.height = maskImg.height;
                            const tempCtx = tempCanvas.getContext('2d')!;
                            
                            // Draw mask in color
                            tempCtx.drawImage(maskImg, 0, 0);
                            tempCtx.globalCompositeOperation = 'source-in';
                            tempCtx.fillStyle = mask.color;
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                            
                            // Draw colored mask on preview
                            ctx.drawImage(tempCanvas, 0, 0, 120, 120);
                          } else {
                            // Draw original mask
                            ctx.drawImage(maskImg, 0, 0, 120, 120);
                          }
                          ctx.globalAlpha = 1;
                        }
                      }}
                      className="w-full h-full"
                    />
                    
                    {/* Selection indicator */}
                    {mask.selected && (
                      <div className="absolute inset-0 border-2 border-blue-500 rounded bg-blue-500 bg-opacity-20">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mask info */}
                  <div className="p-2 text-center">
                    <p className="text-xs text-gray-600">Mask {index + 1}</p>
                    {mask.color && (
                      <div className="flex items-center justify-center mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: mask.color }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Grid actions */}
          <div className="mt-4 flex gap-2 text-xs">
            <button
              onClick={() => {
                masks.forEach(mask => {
                  if (!mask.selected) {
                    onMaskClick(mask.id, true, false);
                  }
                });
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => {
                masks.forEach(mask => {
                  if (mask.selected) {
                    onMaskClick(mask.id, false, true);
                  }
                });
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCanvas;