import { imageDataToBmp } from '../../engine/bitmap/image-data-to-bmp';
export const loadSprites = async (src, spriteSize, spriteLocationMap) => {
    const { width, height } = spriteSize;
    const sprites = {};
    const image = await readImageData(src);
    Object.keys(spriteLocationMap).forEach(key => {
        const location = spriteLocationMap[key];
        let { x: sx, y: sy } = location;
        sx *= width;
        sy *= height;
        const bmp = imageDataToBmp(image, sx, sy, width, height);
        sprites[key] = bmp;
    });
    return sprites;
};
export const loadFont = async (src, fontSize) => {
    const { width, height } = fontSize;
    const image = await readImageData(src);
    const xCount = Math.floor(image.width / width);
    const yCount = Math.floor(image.height / height);
    const count = xCount * yCount;
    const sprites = Array(count);
    for (let y = 0; y < yCount; y++) {
        const sy = y * height;
        for (let x = 0; x < xCount; x++) {
            const sx = x * height;
            const index = y * xCount + x;
            sprites[index] = imageDataToBmp(image, sx, sy, width, height);
        }
    }
    return sprites;
};
export const readImageData = (src) => new Promise((resolve, reject) => {
    try {
        const image = new Image();
        image.onload = () => {
            const { width, height } = image;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, width, height);
            resolve(imageData);
        };
        image.src = src;
    }
    catch (e) {
        reject(e);
    }
});
//# sourceMappingURL=loaders.js.map