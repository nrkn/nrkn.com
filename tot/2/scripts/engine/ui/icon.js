export const createIcon = (label, sprite, fore, back, background, highlight) => {
    const duration = 0;
    const icon = {
        sprite, fore, back, duration, label, background, highlight
    };
    return icon;
};
export const renderIcon = (icon, renderer, { x: tx, y: ty }, spriteSize, selected = false) => {
    const { sprite, fore, back } = icon;
    const { renderRect, renderSprite } = renderer;
    const background = selected ? icon.highlight : icon.background;
    renderRect({
        x: tx * spriteSize.width,
        y: ty * spriteSize.height,
        width: spriteSize.width,
        height: spriteSize.height
    }, background);
    renderSprite(sprite, tx, ty, fore, back);
};
//# sourceMappingURL=icon.js.map