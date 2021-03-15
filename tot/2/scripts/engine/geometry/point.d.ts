import { Point, Size } from './types';
export declare const pointKey: ({ x, y }: Point) => string;
export declare const translate: ({ x: ax, y: ay }: Point, { x: bx, y: by }: Point) => Point;
export declare const scale: ({ x: ax, y: ay }: Point, { x: bx, y: by }: Point) => Point;
export declare const valueToPoint: (v: number) => Point;
export declare const sizeToPoint: ({ width, height }: Size) => {
    x: number;
    y: number;
};
