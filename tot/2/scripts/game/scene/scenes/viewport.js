import { sceneRenderer } from '../../../engine/scene/scene-renderer';
import { decreaseContrastEffect, darkenEffect } from '../../../engine/renderer/effects';
import { frameView } from '../../../engine/map/tiles';
import { eachCell, gridGet } from '../../../engine/grid';
import { applyLights, applyFrameLight } from '../../../engine/color/apply-lights';
import { inRect } from '../../../engine/geometry/rect';
import { scale, valueToPoint, translate } from '../../../engine/geometry/point';
import { viewportSize, viewportCenter } from '../../config';
export const viewportScene = repository => {
    const { resources, config } = repository;
    const { simulation } = config;
    const { state } = simulation;
    const viewportRect = {
        x: 0,
        y: 1,
        width: viewportSize.width,
        height: viewportSize.height
    };
    const { pixelRect, imageData, renderer } = sceneRenderer(resources, viewportRect);
    const { player } = state;
    const { skin, clothes } = player.colors;
    const { renderTiles, renderSprite } = renderer;
    const playerLight = Object.assign({}, player.light, {
        x: viewportCenter.x,
        y: viewportCenter.y
    });
    const showMenu = () => {
        repository.deactivate('viewport');
        repository.deactivate('sidebar');
        repository.activate('menu');
    };
    const tap = (tx, ty) => {
        if (!scene.active)
            return;
        const tilePosition = { x: tx, y: ty };
        if (ty === 0) {
            showMenu();
            repository.dispatchTap('menu', tx, ty);
        }
        if (!inRect(viewportRect, tilePosition))
            return;
        const translateBy = scale(viewportRect, valueToPoint(-1));
        const viewportTilePosition = translate(tilePosition, translateBy);
        tx = viewportTilePosition.x;
        ty = viewportTilePosition.y;
        const playerViewportTile = viewportCenter;
        const deltaX = tx - playerViewportTile.x;
        const deltaY = ty - playerViewportTile.y;
        const dist = Math.hypot(deltaX, deltaY);
        if (dist === 0) {
            input('confirm');
            return;
        }
        const angle = Math.atan2(deltaY, deltaX) / Math.PI;
        const northEast = -0.25;
        const southEast = 0.25;
        const southWest = 0.75;
        const northWest = -0.75;
        if (angle > northWest && angle < northEast) {
            input('up');
        }
        if (angle > southEast && angle < southWest) {
            input('down');
        }
        // the angle sign wraps around on the west side
        if (Math.abs(angle) > 0.75) {
            input('left');
        }
        if (angle > northEast && angle < southEast) {
            input('right');
        }
    };
    const input = (type) => {
        if (type === 'cancel') {
            showMenu();
            return;
        }
        if (type === 'up') {
            simulation.action('up');
        }
        if (type === 'down') {
            simulation.action('down');
        }
        if (type === 'left') {
            simulation.action('left');
        }
        if (type === 'right') {
            simulation.action('right');
        }
    };
    const tick = (timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [decreaseContrastEffect, darkenEffect];
            timestamp = 0;
        }
        const lights = [playerLight];
        const tileView = frameView(state.view, timestamp);
        eachCell(tileView, (tile, x, y) => {
            tile.items.forEach(item => {
                if (item.light) {
                    const light = Object.assign({}, item.light, {
                        x: x + item.light.x,
                        y: y + item.light.y
                    });
                    lights.push(light);
                }
            });
        });
        applyLights(lights, tileView, ({ x, y }, lightness) => {
            const tile = gridGet(tileView, x, y);
            applyFrameLight(tile.background, lightness);
            tile.items.forEach(item => {
                applyFrameLight(item, lightness);
            });
        });
        renderTiles(tileView, { x: 0, y: 0 });
        renderSprite('player', viewportCenter.x, viewportCenter.y, clothes, skin);
    };
    const scene = {
        name: 'viewport',
        tap, input, tick, imageData,
        active: false,
        visible: false,
        pixelRect
    };
    return scene;
};
//# sourceMappingURL=viewport.js.map