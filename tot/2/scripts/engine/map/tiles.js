import { gridGet, eachCell } from '../grid';
import { getFrame } from '../animation';
import { clone } from '../utils';
export const tileBlocks = (grid, { x, y }) => gridGet(grid, x, y).blocks;
export const frameView = (grid, timestamp) => {
    grid = clone(grid);
    eachCell(grid, tile => {
        tile.background = getFrame(tile.background, timestamp);
        tile.items = tile.items.map(item => getFrame(item, timestamp));
    });
    return grid;
};
//# sourceMappingURL=tiles.js.map