import { Fore, Back, Transparent } from '../bitmap/types';
import { inBounds } from '../utils';
import { quantize } from '../color';
import { errorColor } from '../color/consts';
export const blit = (source, dest, x, y, fore, back, quantization = 1) => {
    x = x | 0;
    y = y | 0;
    if (quantization !== 1) {
        fore = quantize(fore, quantization);
        back = quantize(back, quantization);
    }
    for (let sy = 0; sy < source.height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < source.width; sx++) {
            const dx = sx + x;
            if (!inBounds(dx, dy, dest.width, dest.height))
                continue;
            const index = sy * source.width + sx;
            const destIndex = (dy * dest.width + dx) * 4;
            const sourceValue = source.data[index];
            if (sourceValue === Transparent)
                continue;
            let [r, g, b] = errorColor;
            let a = 255;
            if (sourceValue === Fore) {
                [r, g, b] = fore;
            }
            else if (sourceValue === Back) {
                [r, g, b] = back;
            }
            dest.data[destIndex] = r;
            dest.data[destIndex + 1] = g;
            dest.data[destIndex + 2] = b;
            dest.data[destIndex + 3] = a;
        }
    }
};
export const blitPoint = (point, dest, color, quantization = 1) => {
    let { x: dx, y: dy } = point;
    dx = dx | 0;
    dy = dy | 0;
    if (!inBounds(dx, dy, dest.width, dest.height))
        return;
    const destIndex = (dy * dest.width + dx) * 4;
    const [r, g, b] = (quantization === 1 ?
        color :
        quantize(color, quantization));
    dest.data[destIndex] = r;
    dest.data[destIndex + 1] = g;
    dest.data[destIndex + 2] = b;
    dest.data[destIndex + 3] = 255;
};
export const clear = (dest, x, y, width, height) => {
    x = x | 0;
    y = y | 0;
    width = width | 0;
    height = height | 0;
    for (let sy = 0; sy < height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < width; sx++) {
            const dx = sx + x;
            if (!inBounds(dx, dy, dest.width, dest.height))
                continue;
            const destIndex = (dy * dest.width + dx) * 4;
            dest.data[destIndex + 3] = 0;
        }
    }
};
export const blitImageData = (source, dest, x, y, quantization = 1) => {
    x = x | 0;
    y = y | 0;
    for (let sy = 0; sy < source.height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < source.width; sx++) {
            const dx = sx + x;
            if (!inBounds(dx, dy, dest.width, dest.height))
                continue;
            const sourceIndex = (sy * source.width + sx) * 4;
            if (source.data[sourceIndex + 3] < 128)
                continue;
            const destIndex = (dy * dest.width + dx) * 4;
            const color = [
                source.data[sourceIndex],
                source.data[sourceIndex + 1],
                source.data[sourceIndex + 2]
            ];
            const [r, g, b] = (quantization === 1 ?
                color :
                quantize(color, quantization));
            dest.data[destIndex] = r;
            dest.data[destIndex + 1] = g;
            dest.data[destIndex + 2] = b;
            dest.data[destIndex + 3] = 255;
        }
    }
};
//# sourceMappingURL=blit.js.map