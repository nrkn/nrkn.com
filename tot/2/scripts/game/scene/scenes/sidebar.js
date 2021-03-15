import { sceneRenderer } from '../../../engine/scene/scene-renderer';
import { decreaseContrastEffect, darkenEffect } from '../../../engine/renderer/effects';
import { uiBackground, paper, select, ink } from '../../color/consts';
import { interpolateRgb } from '../../../engine/color';
export const sidebarScene = (repository) => {
    const { resources, config } = repository;
    const { simulation } = config;
    const { fontSize } = resources;
    const sidebarRect = {
        x: 11,
        y: 1,
        width: 5,
        height: 11
    };
    const { pixelRect, imageData, renderer } = sceneRenderer(resources, sidebarRect);
    const { player, messages } = simulation.state;
    const { renderRect, renderString } = renderer;
    const statsRect = {
        x: 0,
        y: 0,
        width: pixelRect.width,
        height: fontSize.height * 6 + 1
    };
    const messageRect = {
        x: 0,
        y: statsRect.height,
        width: pixelRect.width,
        height: pixelRect.height - statsRect.height
    };
    const maxMessages = 8;
    const messageFadeStep = 1 / maxMessages;
    const tap = (tx, ty) => {
    };
    const input = (type) => {
    };
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [decreaseContrastEffect, darkenEffect];
        }
        renderRect(statsRect, uiBackground);
        renderRect(messageRect, paper);
        const { str, int, dex, con } = player.stats;
        const { hp, mp } = player;
        const stats = [
            `STR:${String(str).padStart(2, ' ')}`,
            `INT:${String(int).padStart(2, ' ')}`,
            `DEX:${String(dex).padStart(2, ' ')}`,
            `CON:${String(con).padStart(2, ' ')}`,
            `HP:${String(hp).padStart(3, ' ')}`,
            `MP:${String(mp).padStart(3, ' ')}`
        ].join('\n');
        renderString(stats, 1, 1, select, true);
        const recentMessages = (messages.length < maxMessages ?
            [
                ...Array(maxMessages - messages.length).fill(''),
                ...messages
            ] :
            messages.slice(-8));
        recentMessages.forEach((message, y) => {
            const fadeAmount = messageFadeStep * (y + 1);
            const fadeColor = interpolateRgb(ink, paper, fadeAmount);
            y *= fontSize.height;
            renderString(message, 1, messageRect.y + y + 1, fadeColor);
        });
    };
    const scene = {
        name: 'sidebar',
        tap, input, tick, imageData,
        active: false,
        visible: false,
        pixelRect
    };
    return scene;
};
//# sourceMappingURL=sidebar.js.map