import { LogFactory } from './log';
import { gameSceneRepository } from '../engine/scene/game-scene';
import { toggleFullScreen } from './toggle-fullscreen';
import { transformEventPoint } from './transform-event-point';
import { loadResources } from './resources/load-resources';
import { scaleSize } from '../engine/geometry/size';
export const start = async (config) => {
    const { resourceMap, tileSize } = config;
    try {
        const resources = await loadResources(resourceMap);
        const { spriteSize } = resources;
        const canvasSize = scaleSize(tileSize, spriteSize);
        const canvas = document.querySelector('canvas');
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        initClient(canvas, config, resources);
    }
    catch (err) {
        console.error(err);
        return;
    }
};
const initClient = (canvas, config, resources) => {
    const context = canvas.getContext('2d');
    const logger = LogFactory();
    const { spriteSize } = resources;
    // TODO: relies on game
    const onBrowserMessage = (...args) => {
        if (args[0] === 'toggleFullscreen') {
            // firefox oftimes doesn't draw the bottom part after entering fullscreen
            // no solution as yet :/
            toggleFullScreen(document);
        }
        if (args[0] === 'log') {
            const item = args[1];
            logger.add(item);
        }
    };
    const repository = gameSceneRepository(config, resources, onBrowserMessage);
    repository.activate('title');
    repository.show('title');
    logger.replay(repository);
    const { input, tap, tick } = repository;
    const onTick = (timestamp = 0) => {
        tick(timestamp);
        context.putImageData(repository.imageData, 0, 0);
        requestAnimationFrame(onTick);
    };
    const keyboard = (e) => {
        if (e.key === 'ArrowUp') {
            input('up');
        }
        if (e.key === 'ArrowDown') {
            input('down');
        }
        if (e.key === 'ArrowLeft') {
            input('left');
        }
        if (e.key === 'ArrowRight') {
            input('right');
        }
        if (e.key === 'Enter') {
            input('confirm');
        }
        if (e.key === 'Escape') {
            input('cancel');
        }
    };
    const onTap = (eventPoint) => {
        const { x, y } = eventPoint;
        const pixelPoint = transformEventPoint(canvas, { x, y });
        const tx = Math.floor(pixelPoint.x / spriteSize.width);
        const ty = Math.floor(pixelPoint.y / spriteSize.height);
        tap(tx, ty);
    };
    const mouse = (e) => {
        const { offsetX: x, offsetY: y } = e;
        onTap({ x, y });
        e.preventDefault();
    };
    const touch = (e) => {
        const [touch] = e.touches;
        if (!touch)
            return;
        const { clientX: x, clientY: y } = touch;
        onTap({ x, y });
        e.preventDefault();
    };
    document.body.onkeydown = keyboard;
    canvas.onclick = mouse;
    canvas.ontouchend = touch;
    onTick();
};
//# sourceMappingURL=index.js.map