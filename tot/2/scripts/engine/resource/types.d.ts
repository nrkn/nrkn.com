import { Size, Point } from '../geometry/types';
import { Bitmap } from '../bitmap/types';
import { ObjectMap } from '../types';
import { FontKerning } from '../sprites/types';
export declare type ResourceType = 'image' | 'spritesheet' | 'font';
export interface Resource {
    key: string;
    path: string;
    type: ResourceType;
    pixelSize: Size;
}
export interface ImageResource extends Resource {
    type: 'image';
}
export interface SpriteSheetResource extends Resource {
    type: 'spritesheet';
    locations: ObjectMap<Point>;
}
export interface FontResource extends Resource {
    type: 'font';
    kerning: FontKerning;
}
export interface ResourceMap {
    sprites: SpriteSheetResource;
    font: FontResource;
    images: ImageResource[];
}
export interface ResourceDataMap {
    spriteSize: Size;
    fontSize: Size;
    kerning: FontKerning;
    sprites: ObjectMap<Bitmap>;
    font: Bitmap[];
    images: {
        [key: string]: ImageData;
    };
}
