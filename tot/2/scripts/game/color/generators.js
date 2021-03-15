import { clamp } from '../../engine/utils';
import { clampRgb } from '../../engine/color';
export const RandomColors = (random) => {
    const { randInt } = random;
    const randomSkin = () => {
        const n = randInt(256);
        const rD = 164 / 256;
        const gD = 200 / 256;
        const bD = 180 / 256;
        const r = Math.floor(rD * n) + 82;
        const g = Math.floor(gD * n) + 38;
        const b = Math.floor(bD * n) + 21;
        return [r, g, b];
    };
    const randomClothes = () => {
        const r = randInt(32) + 16;
        const b = randInt(56) + 16;
        const g = randInt(56) + 16;
        return [r, g, b];
    };
    const randomBright = (brightness) => {
        brightness = clamp(brightness);
        brightness *= 3;
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0; i < brightness; i++) {
            const channel = randInt(3);
            if (channel === 0)
                r += 1;
            if (channel === 1)
                g += 1;
            if (channel === 2)
                b += 1;
        }
        return clampRgb([r, g, b]);
    };
    return { randomSkin, randomClothes, randomBright };
};
//# sourceMappingURL=generators.js.map