import { Tile } from './types';
import { Grid } from '../grid/types';
import { Point } from '../geometry/types';
export declare const tileBlocks: (grid: Grid<Tile<string>>, { x, y }: Point) => boolean;
export declare const frameView: (grid: Grid<Tile<string>>, timestamp: number) => Grid<Tile<string>>;
