import { multiply, gray } from '../color';
import { line } from '../geometry/line';
import { scaleRect } from '../geometry/rect';
export const createButton = (label, textColor, background, highlight) => {
    const button = {
        label, background, highlight, textColor
    };
    return button;
};
export const renderButton = (button, renderer, tileRect, spriteSize, fontSize, selected = false) => {
    const { label, textColor } = button;
    const { renderRect, renderPoints, renderString, measureTextWidth } = renderer;
    const background = selected ? button.highlight : button.background;
    const backgroundHighlight = multiply(background, ...gray(1.5));
    const backgroundShadow = multiply(background, ...gray(0.66));
    const pixelRect = scaleRect(tileRect, spriteSize);
    const top = pixelRect.y;
    const bottom = pixelRect.y + pixelRect.height - 1;
    const left = pixelRect.x;
    const right = pixelRect.x + pixelRect.width - 1;
    const highlightPoints = [
        ...line(left, top, right - 1, top),
        ...line(left, top + 1, left, bottom - 1)
    ];
    const shadowPoints = [
        ...line(right, top + 1, right, bottom),
        ...line(left + 1, bottom, right - 1, bottom)
    ];
    renderRect(pixelRect, background);
    renderPoints(highlightPoints, backgroundHighlight);
    renderPoints(shadowPoints, backgroundShadow);
    const labelWidth = measureTextWidth(label);
    const lx = (pixelRect.width - labelWidth) / 2 + pixelRect.x;
    const ly = (pixelRect.height - fontSize.height) / 2 + pixelRect.y;
    renderString(label, lx, ly, textColor);
};
//# sourceMappingURL=button.js.map