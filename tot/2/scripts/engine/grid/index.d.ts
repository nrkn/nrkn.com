import { Grid, GridCallback } from './types';
export declare const createGrid: <T>(width: number, height: number) => Grid<T>;
export declare const cloneGrid: <T>(grid: Grid<T>) => Grid<T>;
export declare const gridGet: <T>(grid: Grid<T>, x: number, y: number) => T;
export declare const gridView: <T>(grid: Grid<T>, x: number, y: number, width: number, height: number, empty: T) => Grid<T>;
export declare const eachCell: <T>(grid: Grid<T>, cb: GridCallback<T>) => void;
