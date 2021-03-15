import { Rect, Point, Size } from './types';
export declare const inRect: ({ x: rx, y: ry, width, height }: Rect, { x, y }: Point) => boolean;
export declare const sizeToRect: ({ width, height }: Size) => Rect;
export declare const scaleRect: ({ x, y, width, height }: Rect, { width: sw, height: sh }: Size) => Rect;
