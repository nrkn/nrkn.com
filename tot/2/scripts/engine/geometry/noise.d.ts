import { Random } from '../random/types';
export declare const Noise: (random: Random) => (length: number) => number[];
export declare const resizeNoise: (n: number[], length: number) => number[];
export declare const interpolate: (a: number, b: number, amount?: number) => number;
export declare const noiseAt: (n: number[], index: number) => number;
