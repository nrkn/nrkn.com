import { Light } from '../color/types';
import { Grid } from '../grid/types';
import { SpriteFrame } from '../sprites/types';
export interface Tile<K = string> {
    blocks: boolean;
    seen: boolean;
    background: SpriteFrame<K>;
    items: Item<K>[];
}
export interface Item<K = string> extends SpriteFrame<K> {
    light?: Light;
    next?: Item<K>;
}
export interface TileMap<K = string> {
    tiles: Grid<Tile<K>>;
}
