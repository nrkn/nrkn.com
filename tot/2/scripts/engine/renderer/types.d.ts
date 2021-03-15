import { Rgb } from '../color/types';
import { Grid } from '../grid/types';
import { Tile } from '../map/types';
import { Point, Rect } from '../geometry/types';
export interface RenderSprite {
    <K extends string = string>(key: K, tx: number, ty: number, fore: Rgb, back: Rgb): void;
}
export interface RenderTiles {
    (tiles: Grid<Tile>, offset: Point): void;
}
export interface RenderChar {
    (ch: string, px: number, py: number, fore: Rgb): void;
}
export interface RenderString {
    (s: string, px: number, py: number, fore: Rgb, mono?: boolean): void;
}
export interface RenderPoints {
    (points: Point[], color: Rgb): void;
}
export interface RenderRect {
    (rect: Rect, color: Rgb): void;
}
export interface ClearRect {
    (rect: Rect): void;
}
export interface MeasureTextWidth {
    (text: string): number;
}
export interface RendererEffect {
    (fore: Rgb, back: Rgb): [Rgb, Rgb];
}
export interface Renderer {
    renderSprite: RenderSprite;
    renderTiles: RenderTiles;
    renderChar: RenderChar;
    renderString: RenderString;
    renderRect: RenderRect;
    clearRect: ClearRect;
    renderPoints: RenderPoints;
    measureTextWidth: MeasureTextWidth;
    effects: RendererEffect[];
}
