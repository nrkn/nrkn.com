import { sceneRenderer } from '../../../engine/scene/scene-renderer';
import { desaturateEffect } from '../../../engine/renderer/effects';
import { createIcon, renderIcon } from '../../../engine/ui/icon';
import { black } from '../../../engine/color/consts';
import { paper, uiBackground, selectAlt, select, nearWhite, metal, darkerMetal, darkerWood, wood, darkerMagic, magic, healWounds, uiMagic, magicSelect, darkerLight, light, titleBlue, darkerTitleBlue, darkerPaper } from '../../color/consts';
export const menuScene = repository => {
    const { resources, config } = repository;
    const { tileSize, simulation } = config;
    const { spriteSize } = resources;
    const menuRect = {
        x: 0, y: 0, width: tileSize.width, height: 3
    };
    const { pixelRect, imageData, renderer } = sceneRenderer(resources, menuRect);
    const { player, messages } = simulation.state;
    const { renderSprite, renderRect, clearRect, renderString, measureTextWidth } = renderer;
    const { darkestSkin, darkerSkin, skin, lighterSkin, darkerClothes, clothes, lighterClothes } = player.colors;
    const menuIcons = [
        createIcon('get', 'get', darkerSkin, lighterSkin, uiBackground, select),
        createIcon('use', 'use', darkerSkin, lighterSkin, uiBackground, select),
        createIcon('search', 'eye', darkestSkin, nearWhite, uiBackground, select),
        createIcon('disarm', 'disarm', metal, darkerMetal, uiBackground, select),
        createIcon('rest', 'chair', darkerWood, wood, uiBackground, select),
        createIcon('sleep', 'bed', darkerWood, wood, uiBackground, select),
        createIcon('character', 'player', clothes, skin, uiBackground, select),
        createIcon('inventory', 'pack', darkerClothes, lighterClothes, uiBackground, select),
        createIcon('map', 'map', darkerPaper, paper, uiBackground, select),
        createIcon('cast', 'spell', darkerMagic, magic, uiBackground, select),
        createIcon('cast magic arrow', 'arrow', darkerMagic, magic, uiMagic, magicSelect),
        createIcon('cast heal medium wounds', 'healMedium', healWounds, healWounds, uiMagic, magicSelect),
        createIcon('cast light', 'light', darkerLight, light, uiMagic, magicSelect),
        createIcon('cast reveal', 'eye', darkerMagic, magic, uiMagic, magicSelect),
        createIcon('main menu', 'home', darkerTitleBlue, titleBlue, uiBackground, select),
        createIcon('toggle fullscreen', 'fullScreen', black, nearWhite, uiBackground, select)
    ];
    const menuLength = menuIcons.length;
    let menuSelection = menuLength;
    const getSelection = () => {
        let selection = menuSelection;
        while (selection >= menuLength) {
            selection -= menuLength;
        }
        while (selection < 0) {
            selection += menuLength;
        }
        return selection;
    };
    const tap = (tx, ty, synthetic = false) => {
        if (!scene.active)
            return;
        if (ty === 0 && tx !== menuSelection) {
            if (tx < menuLength) {
                menuSelection = tx;
            }
            return;
        }
        const selectedIcon = menuIcons[getSelection()];
        if (ty < 3 && !synthetic && selectedIcon && selectedIcon.label in actions) {
            actions[selectedIcon.label]();
        }
        exit();
    };
    const exit = () => {
        // keep same selection but prevent double tap on reenter
        menuSelection = menuSelection + menuLength;
        repository.deactivate('menu');
        repository.activate('viewport');
        repository.activate('sidebar');
    };
    const actions = {
        get: () => {
            messages.push('got nowt');
        },
        use: () => {
            messages.push('hand empty');
        },
        search: () => {
            messages.push('found nowt');
        },
        disarm: () => {
            messages.push('no traps');
        },
        'main menu': () => {
            repository.deactivate('menu');
            repository.hide('menu');
            repository.hide('sidebar');
            repository.hide('viewport');
            repository.activate('title');
            repository.show('title');
        },
        'toggle fullscreen': () => {
            repository.browserMessage('toggleFullscreen');
        }
    };
    const input = (type) => {
        if (type === 'left') {
            menuSelection--;
        }
        if (type === 'right') {
            menuSelection++;
        }
        if (type === 'cancel') {
            exit();
        }
        if (type === 'confirm') {
            const selectedIcon = menuIcons[getSelection()];
            if (selectedIcon.label in actions) {
                actions[selectedIcon.label]();
            }
            exit();
        }
    };
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [desaturateEffect];
        }
        renderRect({
            x: 0, y: 0,
            width: pixelRect.width, height: spriteSize.height
        }, uiBackground);
        clearRect({
            x: 0, y: spriteSize.height,
            width: pixelRect.width, height: pixelRect.height - spriteSize.height
        });
        if (scene.active) {
            drawMenuSelection();
        }
        menuIcons.forEach((icon, x) => {
            renderIcon(icon, renderer, { x, y: 0 }, spriteSize, scene.active && x === getSelection());
        });
    };
    const drawMenuSelection = () => {
        renderSprite('arrowUp', getSelection(), 1, selectAlt, select);
        const selectedIcon = menuIcons[getSelection()];
        const { label } = selectedIcon;
        const labelWidth = measureTextWidth(label);
        let labelX = (getSelection() * spriteSize.width - Math.floor(labelWidth / 2)) + Math.floor(spriteSize.width / 2);
        if (labelX < 0)
            labelX = 0;
        if (labelX + labelWidth > pixelRect.width)
            labelX = pixelRect.width - labelWidth;
        renderString(label, labelX + 1, spriteSize.height * 2 + 2, selectAlt);
        renderString(label, labelX, spriteSize.height * 2 + 1, select);
    };
    const scene = {
        name: 'menu',
        tap, input, tick, imageData,
        active: false,
        visible: false,
        pixelRect
    };
    return scene;
};
//# sourceMappingURL=menu.js.map