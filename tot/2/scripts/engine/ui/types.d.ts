import { Rgb } from '../color/types';
import { SpriteFrame } from '../sprites/types';
export interface InputElement {
    label: string;
    background: Rgb;
    highlight: Rgb;
}
export interface Icon extends InputElement, SpriteFrame {
}
export interface Button extends InputElement {
    textColor: Rgb;
}
