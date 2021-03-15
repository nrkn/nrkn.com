export const line = (x0, y0, x1, y1) => {
    x0 = x0 | 0;
    y0 = y0 | 0;
    x1 = x1 | 0;
    y1 = y1 | 0;
    const line = [{ x: x0, y: y0 }];
    const dX = Math.abs(x1 - x0);
    const dY = Math.abs(y1 - y0);
    const sX = x0 < x1 ? 1 : -1;
    const sY = y0 < y1 ? 1 : -1;
    let err = dX - dY;
    while (x0 !== x1 || y0 !== y1) {
        const err2 = 2 * err;
        if (err2 > dY * -1) {
            err -= dY;
            x0 += sX;
        }
        if (err2 < dX) {
            err += dX;
            y0 += sY;
        }
        line.push({ x: x0, y: y0 });
    }
    return line;
};
//# sourceMappingURL=line.js.map