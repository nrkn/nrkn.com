import { SeededRandom } from '../../engine/random';
import { createPlayer } from '../state/player';
import { badMap } from '../map/bad-map';
import { inBounds } from '../../engine/utils';
import { tileBlocks } from '../../engine/map/tiles';
import { gridView, gridGet } from '../../engine/grid';
import { viewportCenter, viewportSize } from '../config';
import { emptyTile } from '../map/tiles';
import { fovLines } from '../../engine/geometry/fov-lines';
export const simulation = (seed) => {
    const random = SeededRandom(seed);
    const player = createPlayer(random);
    const mapSize = { width: 100, height: 100 };
    const map = badMap(mapSize.width, mapSize.height, player, random);
    const messages = [
        'missed',
        '-10 hp',
        'hit',
        '+15 cp',
        'light',
        '+5 gp',
        'trap!',
        '-5 hp',
    ];
    const view = getView(map, player);
    const state = { player, map, view, messages };
    const action = (type, ...args) => {
        if (type in actions) {
            actions[type](state, ...args);
        }
    };
    const simulation = {
        state, action
    };
    return simulation;
};
const actions = {
    up: (state) => move(state, 0, -1),
    down: (state) => move(state, 0, 1),
    left: (state) => move(state, -1, 0),
    right: (state) => move(state, 1, 0)
};
console.log({ viewportSize, viewportCenter });
const fov = fovLines(viewportSize, viewportCenter);
const move = (state, ox, oy) => {
    const { map, player } = state;
    let { x, y } = player;
    x += ox;
    y += oy;
    if (!inBounds(x, y, map.tiles.width, map.tiles.height) ||
        tileBlocks(map.tiles, { x, y })) {
        return;
    }
    player.x = x;
    player.y = y;
    state.view = getView(map, player);
    updateSeen(state);
};
const updateSeen = (state) => {
    fov.forEach(line => {
        let blocked = false;
        for (let i = 0; i < line.length; i++) {
            if (blocked)
                continue;
            const p = line[i];
            const tile = gridGet(state.view, p.x, p.y);
            tile.seen = true;
            if (tile.blocks) {
                blocked = true;
                continue;
            }
        }
    });
};
const getView = (map, player) => gridView(map.tiles, player.x - viewportCenter.x, player.y - viewportCenter.y, viewportSize.width, viewportSize.height, emptyTile());
//# sourceMappingURL=index.js.map