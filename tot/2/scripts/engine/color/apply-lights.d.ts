import { LightCallback, Light } from './types';
import { Size } from '../geometry/types';
import { SpriteFrame } from '../sprites/types';
export declare const applyLights: (lights: Light[], size: Size, cb: LightCallback) => void;
export declare const applyFrameLight: (frame: SpriteFrame<string>, lightness: number) => void;
