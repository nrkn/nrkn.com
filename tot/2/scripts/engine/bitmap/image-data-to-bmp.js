import { bitmap } from '.';
export const imageDataToBmp = (source, sx, sy, width, height) => {
    const bmp = bitmap(width, height);
    for (let y = 0; y < height; y++) {
        const iy = sy + y;
        for (let x = 0; x < width; x++) {
            const ix = sx + x;
            const sourceIndex = (iy * source.width + ix) * 4;
            const destIndex = y * width + x;
            const r = source.data[sourceIndex];
            const a = source.data[sourceIndex + 3];
            if (a === 0) {
                bmp.data[destIndex] = a;
            }
            else {
                if (r < 128) {
                    bmp.data[destIndex] = 1;
                }
                else {
                    bmp.data[destIndex] = 2;
                }
            }
        }
    }
    return bmp;
};
//# sourceMappingURL=image-data-to-bmp.js.map