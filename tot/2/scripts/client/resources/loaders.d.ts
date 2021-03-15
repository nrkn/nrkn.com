import { Point, Size } from '../../engine/geometry/types';
import { Bitmap } from '../../engine/bitmap/types';
import { ObjectMap } from '../../engine/types';
export declare const loadSprites: (src: string, spriteSize: Size, spriteLocationMap: ObjectMap<Point>) => Promise<ObjectMap<Bitmap>>;
export declare const loadFont: (src: string, fontSize: Size) => Promise<Bitmap[]>;
export declare const readImageData: (src: string) => Promise<ImageData>;
