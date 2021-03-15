import { Bitmap } from '../bitmap/types';
import { FontMetrics, FontKerning } from './types';
export declare const bounds: (bmp: Bitmap) => FontMetrics;
export declare const getMetrics: (font: Bitmap[]) => FontMetrics[];
export declare const measureTextWidth: (fontMetrics: FontMetrics[], kerning: FontKerning, text: string) => number;
export declare const getCode: (ch: string) => number;
export declare const getAdvance: (fontMetrics: FontMetrics[], kerning: FontKerning, ch: string, next?: string | undefined) => number;
