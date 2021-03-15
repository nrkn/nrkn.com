import { Icon } from './types';
import { Renderer } from '../renderer/types';
import { Point, Size } from '../geometry/types';
export declare const createIcon: (label: string, sprite: string, fore: [number, number, number], back: [number, number, number], background: [number, number, number], highlight: [number, number, number]) => Icon;
export declare const renderIcon: (icon: Icon, renderer: Renderer, { x: tx, y: ty }: Point, spriteSize: Size, selected?: boolean) => void;
