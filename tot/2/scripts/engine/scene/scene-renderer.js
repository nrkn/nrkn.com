import { createRenderer } from '../renderer/renderer';
import { scaleRect } from '../geometry/rect';
export const sceneRenderer = (resources, tileRect) => {
    const { spriteSize } = resources;
    const pixelRect = scaleRect(tileRect, spriteSize);
    const imageData = new ImageData(pixelRect.width, pixelRect.height);
    const renderer = createRenderer(imageData, resources);
    return { pixelRect, imageData, renderer };
};
//# sourceMappingURL=scene-renderer.js.map