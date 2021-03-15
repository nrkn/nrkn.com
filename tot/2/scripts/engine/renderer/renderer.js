import { Fore } from '../bitmap/types';
import { blit, clear, blitPoint } from './blit';
import { bitmap } from '../bitmap';
import { black, errorColor } from '../color/consts';
import { getMetrics, measureTextWidth, getCode, getAdvance } from '../sprites/font';
export const createRenderer = (imageData, resources) => {
    const { spriteSize, fontSize, kerning, sprites, font } = resources;
    const fontMetrics = getMetrics(font);
    const renderSprite = (key, tx, ty, fore, back) => {
        const bmp = sprites[key];
        renderer.effects.forEach(effect => {
            [fore, back] = effect(fore, back);
        });
        blit(bmp, imageData, tx * spriteSize.width, ty * spriteSize.height, fore, back);
    };
    const renderTiles = (tiles, offset) => {
        const { x: ox, y: oy } = offset;
        for (let y = 0; y < tiles.height; y++) {
            const ty = y + oy;
            for (let x = 0; x < tiles.width; x++) {
                const tx = x + ox;
                const index = y * tiles.width + x;
                const t = tiles.data[index];
                const { seen } = t;
                const { sprite, fore, back } = t.background;
                if (!seen) {
                    renderSprite('floor0', tx, ty, black, black);
                    continue;
                }
                renderSprite(sprite, tx, ty, fore, back);
                t.items.forEach(item => {
                    const { sprite, fore, back } = item;
                    renderSprite(sprite, tx, ty, fore, back);
                });
            }
        }
    };
    const renderChar = (ch, x, y, color) => {
        const code = ch.charCodeAt(0) - 32;
        const bmp = font[code];
        if (!bmp)
            return;
        renderer.effects.forEach(effect => {
            [color] = effect(color, errorColor);
        });
        blit(bmp, imageData, x, y, color, errorColor);
    };
    const renderString = (s, x, y, color, mono = false) => {
        const chars = s.split('');
        let cx = 0;
        let cy = 0;
        chars.forEach((ch, i) => {
            const code = getCode(ch);
            if (ch === '\n') {
                cx = 0;
                cy += fontSize.height;
            }
            const metrics = fontMetrics[code];
            if (!metrics)
                return;
            let dx = x + cx;
            if (!mono) {
                dx += metrics.x;
            }
            renderChar(ch, dx, y + cy, color);
            cx += (mono ?
                fontSize.width :
                getAdvance(fontMetrics, kerning, ch, chars[i + 1]));
        });
    };
    const renderRect = (rect, color) => {
        const bmp = bitmap(rect.width, rect.height);
        bmp.data.fill(Fore);
        renderer.effects.forEach(effect => {
            [color] = effect(color, errorColor);
        });
        blit(bmp, imageData, rect.x, rect.y, color, errorColor);
    };
    const clearRect = rect => {
        clear(imageData, rect.x, rect.y, rect.width, rect.height);
    };
    const renderPoints = (points, color) => {
        points.forEach(p => {
            blitPoint(p, imageData, color);
        });
    };
    const effects = [];
    const renderer = {
        renderSprite,
        renderTiles,
        renderChar,
        renderString,
        renderRect,
        clearRect,
        renderPoints,
        measureTextWidth: (text) => measureTextWidth(fontMetrics, kerning, text),
        effects
    };
    return renderer;
};
//# sourceMappingURL=renderer.js.map