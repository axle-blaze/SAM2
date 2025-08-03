import React from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';

interface MaskOverlayProps {
    masks: Array<{ segmentation: number[][]; color: string }>;
    width: number;
    height: number;
}

const MaskOverlay: React.FC<MaskOverlayProps> = ({ masks, width, height }) => {
    return (
        <Layer>
            {masks.map((mask, index) => (
                <KonvaImage
                    key={index}
                    image={createImageFromMask(mask.segmentation, mask.color)}
                    width={width}
                    height={height}
                />
            ))}
        </Layer>
    );
};

const createImageFromMask = (segmentation: number[][], color: string): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Image();

    const width = Math.max(...segmentation.map(point => point[0])) + 1;
    const height = Math.max(...segmentation.map(point => point[1])) + 1;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'destination-out';
    segmentation.forEach(point => {
        ctx.fillRect(point[0], point[1], 1, 1);
    });

    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
};

export default MaskOverlay;