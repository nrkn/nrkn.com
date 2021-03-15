import { clampRgb } from '../../engine/color';
import { Noise } from '../../engine/geometry/noise';
export const CreateTorch = (random) => {
    const { randInt } = random;
    const noise = Noise(random);
    const createTorch = () => {
        const torchNoise = noise(randInt(16) + 16);
        const first = randomTorch(torchNoise[0]);
        let prev = first;
        for (let i = 1; i < torchNoise.length; i++) {
            const current = randomTorch(torchNoise[i]);
            prev.next = current;
            prev = current;
        }
        return first;
    };
    const randomTorch = (noise) => {
        const sprite = 'torchOverlay';
        const fore = [128, 64, 0];
        let backRed = 223;
        let backGreen = 223;
        const channel = randInt(2);
        if (channel) {
            backRed += noise * 32;
        }
        else {
            backRed += noise * 32;
            backGreen += noise * 32;
        }
        const back = clampRgb([backRed, backGreen, 0]);
        const light = torchLight(0, 0, noise);
        const duration = randInt(25) + 100;
        const torch = {
            sprite, fore, back, light, duration
        };
        return torch;
    };
    return createTorch;
};
const torchLight = (x, y, noise) => {
    const radiusModifier = 0.5 * noise;
    const strengthModifier = 0.125 * noise;
    const light = {
        x, y,
        radius: 4.5 + radiusModifier,
        strength: 0.5 + strengthModifier
    };
    return light;
};
//# sourceMappingURL=torch.js.map