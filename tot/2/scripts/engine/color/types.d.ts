import { Circle, Point } from '../geometry/types';
export declare type Rgb = [number, number, number];
export interface Light extends Circle {
    strength: number;
}
export declare type LightCallback = (p: Point, lightness: number) => void;
