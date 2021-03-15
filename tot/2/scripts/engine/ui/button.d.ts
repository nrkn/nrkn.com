import { Button } from './types';
import { Renderer } from '../renderer/types';
import { Rect, Size } from '../geometry/types';
export declare const createButton: (label: string, textColor: [number, number, number], background: [number, number, number], highlight: [number, number, number]) => Button;
export declare const renderButton: (button: Button, renderer: Renderer, tileRect: Rect, spriteSize: Size, fontSize: Size, selected?: boolean) => void;
