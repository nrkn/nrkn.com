export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface Circle extends Point {
    radius: number;
}
export interface Rect extends Point, Size {
}
export interface PointAction {
    (x: number, y: number): void;
}
