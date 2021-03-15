import { Transparent } from '../bitmap/types';
import { gridGet } from '../grid';
const firstColumn = (bmp) => {
    for (let x = 0; x < bmp.width; x++) {
        for (let y = 0; y < bmp.height; y++) {
            if (gridGet(bmp, x, y) !== Transparent)
                return x;
        }
    }
    return -1;
};
const lastColumn = (bmp) => {
    for (let x = bmp.width - 1; x >= 0; x--) {
        for (let y = 0; y < bmp.height; y++) {
            if (gridGet(bmp, x, y) !== Transparent)
                return x;
        }
    }
    return -1;
};
export const bounds = (bmp) => {
    const charBounds = {
        x: 0,
        advance: 2,
        height: bmp.height
    };
    const first = firstColumn(bmp);
    if (first === -1)
        return charBounds;
    const last = lastColumn(bmp);
    const width = last - first;
    charBounds.x = -first;
    charBounds.advance = width + 2;
    return charBounds;
};
export const getMetrics = (font) => {
    const metrics = Array(font.length);
    for (let i = 0; i < font.length; i++) {
        metrics[i] = bounds(font[i]);
    }
    return metrics;
};
export const measureTextWidth = (fontMetrics, kerning, text) => {
    const chars = text.split('');
    let width = 0;
    chars.forEach((ch, i) => {
        const code = getCode(ch);
        const metrics = fontMetrics[code];
        if (!metrics)
            return 0;
        width += getAdvance(fontMetrics, kerning, ch, chars[i + 1]);
    });
    return width;
};
export const getCode = (ch) => ch.charCodeAt(0) - 32;
export const getAdvance = (fontMetrics, kerning, ch, next) => {
    const code = getCode(ch);
    const metrics = fontMetrics[code];
    if (!metrics)
        return 0;
    let { advance } = metrics;
    if (ch in kerning && next) {
        const map = kerning[ch];
        if (next in map) {
            advance += map[next];
        }
    }
    return advance;
};
//# sourceMappingURL=font.js.map