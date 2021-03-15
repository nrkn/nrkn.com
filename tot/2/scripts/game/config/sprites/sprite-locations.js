const mobY = 0;
const overlayY = 1;
const tileY = 2;
const itemY = 3;
const iconY = 4;
const spellY = 5;
export const spriteLocationMap = {
    player: { x: 0, y: mobY },
    ghost: { x: 1, y: mobY },
    devil: { x: 2, y: mobY },
    shieldOverlay: { x: 0, y: overlayY },
    swordOverlay: { x: 1, y: overlayY },
    torchOverlay: { x: 2, y: overlayY },
    stairs: { x: 0, y: tileY },
    floor0: { x: 1, y: tileY },
    floor1: { x: 2, y: tileY },
    floor2: { x: 3, y: tileY },
    floor3: { x: 4, y: tileY },
    wall1: { x: 5, y: tileY },
    wall2: { x: 6, y: tileY },
    sword: { x: 0, y: itemY },
    potion: { x: 1, y: itemY },
    shield: { x: 2, y: itemY },
    coins: { x: 3, y: itemY },
    get: { x: 0, y: iconY },
    use: { x: 1, y: iconY },
    eye: { x: 2, y: iconY },
    disarm: { x: 3, y: iconY },
    chair: { x: 4, y: iconY },
    bed: { x: 5, y: iconY },
    pack: { x: 6, y: iconY },
    map: { x: 7, y: iconY },
    spell: { x: 8, y: iconY },
    arrowUp: { x: 9, y: iconY },
    home: { x: 10, y: iconY },
    fullScreen: { x: 11, y: iconY },
    healMinor: { x: 0, y: spellY },
    healMedium: { x: 1, y: spellY },
    healMajor: { x: 2, y: spellY },
    light: { x: 3, y: spellY },
    arrow: { x: 4, y: spellY },
};
//# sourceMappingURL=sprite-locations.js.map