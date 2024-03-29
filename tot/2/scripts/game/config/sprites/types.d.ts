import { ObjectMap } from '../../../engine/types';
export declare type SpriteKey<T = any> = keyof SpriteMap<T>;
export interface SpriteMap<T = any> extends ObjectMap<T> {
    player: T;
    ghost: T;
    devil: T;
    shieldOverlay: T;
    swordOverlay: T;
    torchOverlay: T;
    stairs: T;
    floor0: T;
    floor1: T;
    floor2: T;
    floor3: T;
    wall1: T;
    wall2: T;
    sword: T;
    potion: T;
    shield: T;
    coins: T;
    get: T;
    use: T;
    eye: T;
    disarm: T;
    chair: T;
    bed: T;
    pack: T;
    map: T;
    spell: T;
    arrowUp: T;
    home: T;
    fullScreen: T;
    healMinor: T;
    healMedium: T;
    healMajor: T;
    light: T;
    arrow: T;
}
