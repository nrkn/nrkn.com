import { TileMap } from '../../engine/map/types';
import { Point } from '../../engine/geometry/types';
import { Random } from '../../engine/random/types';
export declare const badMap: (width: number, height: number, playerStart: Point, random: Random) => TileMap<string>;
