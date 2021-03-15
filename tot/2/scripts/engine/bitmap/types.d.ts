import { Grid } from '../grid/types';
export declare const Transparent: BitmapData;
export declare const Fore: BitmapData;
export declare const Back: BitmapData;
export declare type BitmapData = 0 | 1 | 2;
export interface Bitmap extends Grid<BitmapData> {
}
