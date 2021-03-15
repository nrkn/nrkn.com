import { multiply } from '../../engine/color';
import { RandomColors } from '../color/generators';
export const createPlayer = (random) => {
    const { dice } = random;
    const { randomSkin, randomClothes } = RandomColors(random);
    const x = 50;
    const y = 50;
    const str = dice(16) + 3;
    const int = dice(16) + 3;
    const dex = dice(16) + 3;
    const con = dice(16) + 3;
    const stats = { str, int, dex, con };
    const hp = con * 10;
    const mp = int * 10;
    const skin = randomSkin();
    const clothes = randomClothes();
    const darkestSkin = multiply(skin, 0.33, 0.33, 0.33);
    const darkerSkin = multiply(skin, 0.66, 0.66, 0.66);
    const lighterSkin = multiply(skin, 1.5, 1.5, 1.5);
    const darkerClothes = multiply(clothes, 0.66, 0.66, 0.66);
    const lighterClothes = multiply(clothes, 1.5, 1.5, 1.5);
    const colors = {
        darkestSkin, darkerSkin, skin, lighterSkin,
        darkerClothes, clothes, lighterClothes
    };
    const light = {
        x: 0,
        y: 0,
        radius: 4,
        strength: 0.75
    };
    const player = {
        x, y, colors, stats, hp, mp, light
    };
    return player;
};
//# sourceMappingURL=player.js.map