import { sceneRenderer } from '../../../engine/scene/scene-renderer';
import { blitImageData } from '../../../engine/renderer/blit';
import { createButton, renderButton } from '../../../engine/ui/button';
import { sizeToRect } from '../../../engine/geometry/rect';
import { uiBackground, select, selectAlt } from '../../color/consts';
export const titleScene = repository => {
    const { resources, config } = repository;
    const { tileSize } = config;
    const { spriteSize, fontSize } = resources;
    const { pixelRect, imageData, renderer } = sceneRenderer(resources, sizeToRect(tileSize));
    const { title } = resources.images;
    const exit = () => {
        repository.deactivate('title');
        repository.hide('title');
        repository.show('menu');
        repository.show('sidebar');
        repository.show('viewport');
        repository.deactivate('menu');
        repository.activate('sidebar');
        repository.activate('viewport');
    };
    const tap = (_tx, _ty) => {
        if (!scene.active)
            return;
        exit();
    };
    const input = (type) => {
        if (!scene.active)
            return;
        if (type === 'confirm') {
            exit();
        }
        if (type === 'cancel') {
            exit();
        }
    };
    const continueButton = createButton('continue', select, uiBackground, selectAlt);
    const restartButton = createButton('new', select, uiBackground, selectAlt);
    const helpButton = createButton('help', select, uiBackground, selectAlt);
    const buttons = [continueButton, restartButton, helpButton];
    const buttonsX = 1;
    const buttonsY = tileSize.height - 2;
    const buttonsWidth = tileSize.width - 2;
    const gutters = buttons.length - 1;
    const availWidth = buttonsWidth - gutters;
    const buttonWidth = Math.floor(availWidth / buttons.length);
    let buttonSelection = 0;
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        blitImageData(title, imageData, 0, 0);
        buttons.forEach((button, x) => {
            const rect = {
                x: x * (buttonWidth + 1) + buttonsX,
                y: buttonsY,
                width: buttonWidth,
                height: 1
            };
            renderButton(button, renderer, rect, spriteSize, fontSize, x === buttonSelection);
        });
    };
    const scene = {
        name: 'title',
        tap, input, tick, imageData,
        active: false,
        visible: false,
        pixelRect
    };
    return scene;
};
//# sourceMappingURL=title.js.map