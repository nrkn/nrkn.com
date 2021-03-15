export const inBounds = (x, y, width, height) => x >= 0 && y >= 0 && x < width && y < height;
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const clamp = (n, min = 0, max = 255) => n < min ? min : n > max ? max : n;
//# sourceMappingURL=index.js.map