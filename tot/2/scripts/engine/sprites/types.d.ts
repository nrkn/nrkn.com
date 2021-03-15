import { AnimationFrame } from '../animation/types';
import { Rgb } from '../color/types';
export interface FontMetrics {
    x: number;
    advance: number;
    height: number;
}
export interface SpriteFrame<SpriteKey = string> extends AnimationFrame {
    sprite: SpriteKey;
    fore: Rgb;
    back: Rgb;
    next?: SpriteFrame<SpriteKey>;
}
export interface FontKerning {
    [from: string]: {
        [to: string]: number;
    };
}
