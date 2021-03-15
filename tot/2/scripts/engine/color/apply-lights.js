import { clamp } from '../utils';
import { multiply, gray } from '.';
export const applyLights = (lights, size, cb) => {
    const { width, height } = size;
    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            let lightAmount = 0;
            lights.forEach(light => {
                const { x, y, radius, strength } = light;
                const distX = Math.abs(x - sx);
                const distY = Math.abs(y - sy);
                const dist = Math.hypot(distX, distY);
                const lightness = clamp(radius - dist, 0, radius) / radius;
                lightAmount += (lightness * strength);
            });
            lightAmount = clamp(lightAmount, 0, 1);
            cb({ x: sx, y: sy }, lightAmount);
        }
    }
};
export const applyFrameLight = (frame, lightness) => {
    let { fore, back } = frame;
    fore = multiply(fore, ...gray(lightness));
    back = multiply(back, ...gray(lightness));
    Object.assign(frame, { fore, back });
};
//# sourceMappingURL=apply-lights.js.map