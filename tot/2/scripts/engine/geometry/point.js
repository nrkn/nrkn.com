export const pointKey = ({ x, y }) => `${x},${y}`;
export const translate = ({ x: ax, y: ay }, { x: bx, y: by }) => ({ x: ax + bx, y: ay + by });
export const scale = ({ x: ax, y: ay }, { x: bx, y: by }) => ({ x: ax * bx, y: ay * by });
export const valueToPoint = (v) => ({ x: v, y: v });
export const sizeToPoint = ({ width, height }) => ({ x: width, y: height });
//# sourceMappingURL=point.js.map