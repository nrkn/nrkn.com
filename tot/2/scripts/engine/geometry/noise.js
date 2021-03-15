import { clamp } from '../utils';
export const Noise = (random) => {
    const noise = (length) => {
        const n = Array(length);
        for (let i = 0; i < length; i++) {
            n[i] = random.next();
        }
        return n;
    };
    return noise;
};
export const resizeNoise = (n, length) => {
    const resized = Array(length);
    const step = n.length / length;
    for (let i = 0; i < length; i++) {
        resized[i] = noiseAt(n, i * step);
    }
    return resized;
};
export const interpolate = (a, b, amount = 0.5) => {
    const bD = 1 - amount;
    const value = a * amount + b * bD;
    return clamp(value, 0, 1);
};
export const noiseAt = (n, index) => {
    const lowerIndex = Math.floor(index) % n.length;
    const upperIndex = Math.ceil(index) % n.length;
    if (lowerIndex === upperIndex)
        return n[lowerIndex];
    let delta = Math.abs(Math.max(upperIndex, lowerIndex) - index % n.length);
    if (lowerIndex > upperIndex)
        delta = 1 - delta;
    return interpolate(n[lowerIndex], n[upperIndex], delta);
};
//# sourceMappingURL=noise.js.map