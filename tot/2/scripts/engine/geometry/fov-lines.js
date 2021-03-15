import { line } from './line';
export const fovLines = ({ width, height }, { x: cx, y: cy }) => {
    const lines = [];
    for (let x = 0; x < width; x++) {
        const toTop = line(cx, cy, x, 0);
        const toBottom = line(cx, cy, x, height - 1);
        lines.push(toTop, toBottom);
    }
    for (let y = 0; y < height; y++) {
        const toLeft = line(cx, cy, 0, y);
        const toRight = line(cx, cy, width - 1, y);
        lines.push(toLeft, toRight);
    }
    return lines;
};
//# sourceMappingURL=fov-lines.js.map