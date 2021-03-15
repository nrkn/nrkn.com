export const inRect = ({ x: rx, y: ry, width, height }, { x, y }) => {
    if (x < rx)
        return false;
    if (y < ry)
        return false;
    if (x >= rx + width)
        return false;
    if (y >= ry + height)
        return false;
    return true;
};
export const sizeToRect = ({ width, height }) => {
    const x = 0;
    const y = 0;
    return { x, y, width, height };
};
export const scaleRect = ({ x, y, width, height }, { width: sw, height: sh }) => {
    x *= sw;
    y *= sh;
    width *= sw;
    height *= sh;
    return { x, y, width, height };
};
//# sourceMappingURL=rect.js.map