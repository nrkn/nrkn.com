import { Transparent } from './types';
import { createGrid } from '../grid';
export const bitmap = (width, height) => {
    const bmp = createGrid(width, height);
    bmp.data.fill(0);
    return bmp;
};
export const isEmpty = (bmp) => bmp.data.every(c => c === Transparent);
//# sourceMappingURL=index.js.map