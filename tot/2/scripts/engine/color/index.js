import { clamp } from '../utils';
export const clampRgb = ([r, g, b]) => [
    Math.floor(clamp(r)),
    Math.floor(clamp(g)),
    Math.floor(clamp(b))
];
export const multiply = (rgb, mr = 1, mg = 1, mb = 1) => {
    let [r, g, b] = rgb;
    r *= mr;
    g *= mg;
    b *= mb;
    return clampRgb([r, g, b]);
};
export const darken = (rgb, dr = 0, dg = 0, db = 0) => {
    let [r, g, b] = rgb;
    r -= dr;
    g -= dg;
    b -= db;
    return clampRgb([r, g, b]);
};
export const gray = (v) => [v, v, v];
export const toGray = ([r, g, b]) => {
    const sum = r + g + b;
    r = sum / 3;
    g = sum / 3;
    b = sum / 3;
    return clampRgb([r, g, b]);
};
export const interpolateRgb = (from, to, amount = 0.5) => {
    const bAmount = 1 - amount;
    const [fr, fg, fb] = from;
    const [tr, tg, tb] = to;
    const r = fr * amount + tr * bAmount;
    const g = fg * amount + tg * bAmount;
    const b = fb * amount + tb * bAmount;
    return clampRgb([r, g, b]);
};
export const quantize = ([r, g, b], amount = 16) => {
    r = Math.floor(r / amount) * amount;
    g = Math.floor(g / amount) * amount;
    b = Math.floor(b / amount) * amount;
    return [r, g, b];
};
//# sourceMappingURL=index.js.map