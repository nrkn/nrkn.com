import { clone, inBounds } from '../utils';
export const createGrid = (width, height) => {
    width = width | 0;
    height = height | 0;
    const size = width * height;
    if (size < 1)
        throw Error('Expected size to be > 0');
    const data = new Array(size);
    const grid = { width, height, data };
    return grid;
};
export const cloneGrid = (grid) => {
    const { width, height, data } = grid;
    const cloned = {
        width, height, data: data.map(clone)
    };
    return cloned;
};
export const gridGet = (grid, x, y) => {
    const index = y * grid.width + x;
    return grid.data[index];
};
export const gridView = (grid, x, y, width, height, empty) => {
    const data = Array(width * height);
    for (let dy = 0; dy < height; dy++) {
        const sy = dy + y;
        for (let dx = 0; dx < width; dx++) {
            const sx = dx + x;
            const destIndex = dy * width + dx;
            if (!inBounds(sx, sy, grid.width, grid.height)) {
                data[destIndex] = empty;
                continue;
            }
            const sourceIndex = sy * grid.width + sx;
            data[destIndex] = grid.data[sourceIndex];
        }
    }
    const view = {
        width, height, data
    };
    return view;
};
export const eachCell = (grid, cb) => {
    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            cb(gridGet(grid, x, y), x, y);
        }
    }
};
//# sourceMappingURL=index.js.map