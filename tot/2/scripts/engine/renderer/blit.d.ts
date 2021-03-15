import { Bitmap } from '../bitmap/types';
import { Point } from '../geometry/types';
export declare const blit: (source: Bitmap, dest: ImageData, x: number, y: number, fore: [number, number, number], back: [number, number, number], quantization?: number) => void;
export declare const blitPoint: (point: Point, dest: ImageData, color: [number, number, number], quantization?: number) => void;
export declare const clear: (dest: ImageData, x: number, y: number, width: number, height: number) => void;
export declare const blitImageData: (source: ImageData, dest: ImageData, x: number, y: number, quantization?: number) => void;
