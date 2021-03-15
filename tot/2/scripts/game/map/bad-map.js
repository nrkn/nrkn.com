import { darken, interpolateRgb, gray, multiply } from '../../engine/color';
import { RandomColors } from '../color/generators';
import { CreateTorch } from './torch';
import { createTile } from './tiles';
import { createGrid } from '../../engine/grid';
const floorBase = 128;
const floorVariationRange = 4;
const floorVariationAmount = 4;
export const badMap = (width, height, playerStart, random) => {
    const { dice, pick, randInt } = random;
    const { randomBright } = RandomColors(random);
    const createTorch = CreateTorch(random);
    const floorFore = () => (dice(floorVariationRange) + 1) * -floorVariationAmount;
    const floorBack = () => dice(floorVariationRange) * -floorVariationAmount;
    const randomTile = () => pick([
        'wall1', 'floor0', 'floor1', 'floor2', 'floor3'
    ]);
    const tiles = createGrid(width, height);
    const map = { tiles };
    const wallLight = randomBright(128);
    const wallDark = darken(wallLight, ...randomBright(32));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const t = (x === playerStart.x && y === playerStart.y ?
                'floor0' :
                randomTile());
            const tile = createTile();
            if (t === 'wall1') {
                Object.assign(tile.background, {
                    sprite: t,
                    fore: wallDark,
                    back: wallLight
                });
                if (!randInt(10)) {
                    tile.items.push(createTorch());
                }
            }
            else {
                const b = floorBase + floorBack();
                const f = b + floorFore();
                const blendB = interpolateRgb(gray(b), wallLight, 0.9);
                const blendF = interpolateRgb(gray(f), wallLight, 0.9);
                const back = multiply(blendB, 0.9, 1, 1.1);
                const fore = multiply(blendF, 0.9, 1, 1.1);
                tile.blocks = false;
                Object.assign(tile.background, {
                    sprite: t,
                    fore,
                    back
                });
            }
            tiles.data[index] = tile;
        }
    }
    return map;
};
//# sourceMappingURL=bad-map.js.map