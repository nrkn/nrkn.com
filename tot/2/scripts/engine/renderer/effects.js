import { toGray, interpolateRgb, multiply } from '../color';
export const grayscaleEffect = (fore, back) => [toGray(fore), toGray(back)];
export const desaturateEffect = (fore, back) => {
    let grayFore = toGray(fore);
    let grayBack = toGray(back);
    return [
        interpolateRgb(fore, grayFore, 0.25),
        interpolateRgb(back, grayBack, 0.25)
    ];
};
export const decreaseContrastEffect = (fore, back) => {
    const midGray = [128, 128, 128];
    return [
        interpolateRgb(fore, midGray, 0.5),
        interpolateRgb(back, midGray, 0.5)
    ];
};
export const darkenEffect = (fore, back) => [
    multiply(fore, 0.25, 0.25, 0.25),
    multiply(back, 0.25, 0.25, 0.25),
];
//# sourceMappingURL=effects.js.map