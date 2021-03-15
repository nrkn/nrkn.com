import { Point } from '../../engine/geometry/types';
import { Rgb, Light } from '../../engine/color/types';
import { TileMap, Tile } from '../../engine/map/types';
import { Grid } from '../../engine/grid/types';
export interface Player extends Point {
    colors: PlayerColors;
    stats: Stats;
    hp: number;
    mp: number;
    light: Light;
}
export interface PlayerColors {
    darkestSkin: Rgb;
    darkerSkin: Rgb;
    skin: Rgb;
    lighterSkin: Rgb;
    darkerClothes: Rgb;
    clothes: Rgb;
    lighterClothes: Rgb;
}
export interface Stats {
    str: number;
    int: number;
    dex: number;
    con: number;
}
export interface GameState {
    player: Player;
    map: TileMap;
    view: Grid<Tile>;
    messages: string[];
}
