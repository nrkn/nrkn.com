import { errorColor, black } from '../../engine/color/consts';
export const createTile = () => {
    return {
        blocks: true,
        seen: false,
        background: {
            sprite: 'floor0',
            fore: errorColor,
            back: errorColor,
            duration: 0
        },
        items: []
    };
};
export const emptyTile = () => {
    const empty = createTile();
    Object.assign(empty.background, {
        fore: black,
        back: black
    });
    return empty;
};
//# sourceMappingURL=tiles.js.map