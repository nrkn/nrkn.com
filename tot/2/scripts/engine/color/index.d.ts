export declare const clampRgb: ([r, g, b]: [number, number, number]) => [number, number, number];
export declare const multiply: (rgb: [number, number, number], mr?: number, mg?: number, mb?: number) => [number, number, number];
export declare const darken: (rgb: [number, number, number], dr?: number, dg?: number, db?: number) => [number, number, number];
export declare const gray: (v: number) => [number, number, number];
export declare const toGray: ([r, g, b]: [number, number, number]) => [number, number, number];
export declare const interpolateRgb: (from: [number, number, number], to: [number, number, number], amount?: number) => [number, number, number];
export declare const quantize: ([r, g, b]: [number, number, number], amount?: number) => [number, number, number];
