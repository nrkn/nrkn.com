import { spriteLocationMap } from '../sprites/sprite-locations';
import { kerning } from '../font/kerning';
const sprites = {
    key: 'sprites',
    path: 'sprites.png',
    type: 'spritesheet',
    pixelSize: {
        width: 8,
        height: 8
    },
    locations: spriteLocationMap
};
const font = {
    key: 'font',
    path: 'font.png',
    type: 'font',
    pixelSize: {
        width: 6,
        height: 6
    },
    kerning
};
const titleImage = {
    key: 'title',
    path: 'title.png',
    type: 'image',
    pixelSize: {
        width: 128,
        height: 96
    }
};
const images = [titleImage];
export const resourceMap = { sprites, font, images };
//# sourceMappingURL=index.js.map