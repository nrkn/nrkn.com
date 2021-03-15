import { loadFont, readImageData, loadSprites } from './loaders';
export const loadResources = async (resourceMap) => {
    const { path: spritePath, pixelSize: spriteSize, locations } = resourceMap.sprites;
    const sprites = await loadSprites(spritePath, spriteSize, locations);
    const { path: fontPath, pixelSize: fontSize, kerning } = resourceMap.font;
    const font = await loadFont(fontPath, fontSize);
    const images = {};
    const dataMap = {
        spriteSize, fontSize, kerning, sprites, font, images
    };
    for (let i = 0; i < resourceMap.images.length; i++) {
        const { key, path } = resourceMap.images[i];
        dataMap.images[key] = await readImageData(path);
    }
    return dataMap;
};
//# sourceMappingURL=load-resources.js.map