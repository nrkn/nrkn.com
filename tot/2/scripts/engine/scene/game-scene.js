import { blitImageData } from '../renderer/blit';
import { scaleSize } from '../geometry/size';
export const gameSceneRepository = (config, resources, browserMessage) => {
    const { tileSize, quantization } = config;
    const { spriteSize } = resources;
    const canvasSize = scaleSize(tileSize, spriteSize);
    const imageData = new ImageData(canvasSize.width, canvasSize.height);
    const activate = (key) => {
        scenes[key].active = true;
    };
    const deactivate = (key) => {
        scenes[key].active = false;
    };
    const show = (key) => {
        scenes[key].visible = true;
    };
    const hide = (key) => {
        scenes[key].visible = false;
    };
    const dispatchTap = (key, tx, ty) => {
        scenes[key].tap(tx, ty, true);
    };
    const dispatchInput = (key, input) => {
        scenes[key].input(input, true);
    };
    const eachScene = (keys, cb) => {
        keys.forEach(key => {
            const scene = scenes[key];
            cb(scene, key);
        });
    };
    const tick = (timestamp) => {
        eachScene(keys, scene => {
            scene.tick(timestamp);
            if (scene.visible) {
                const { pixelRect } = scene;
                blitImageData(scene.imageData, imageData, pixelRect.x, pixelRect.y, quantization);
            }
        });
    };
    const input = (type, synthetic = false) => {
        if (!synthetic)
            browserMessage('log', type);
        const activeKeys = keys.filter(key => scenes[key].active);
        eachScene(activeKeys, scene => scene.input(type));
    };
    const tap = (tx, ty, synthetic = false) => {
        if (!synthetic)
            browserMessage('log', [tx, ty]);
        const activeKeys = keys.filter(key => scenes[key].active);
        eachScene(activeKeys, scene => scene.tap(tx, ty));
    };
    const scenes = {};
    const repository = {
        input, tap, tick, imageData,
        activate, deactivate, show, hide, dispatchTap, dispatchInput,
        config, resources,
        browserMessage
    };
    config.scenes.forEach(factory => {
        const scene = factory(repository);
        scenes[scene.name] = scene;
    });
    const keys = Object.keys(scenes);
    return repository;
};
//# sourceMappingURL=game-scene.js.map