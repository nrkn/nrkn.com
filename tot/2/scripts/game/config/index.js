import { resourceMap } from './resources';
import { sidebarScene } from '../scene/scenes/sidebar';
import { viewportScene } from '../scene/scenes/viewport';
import { menuScene } from '../scene/scenes/menu';
import { titleScene } from '../scene/scenes/title';
import { simulation } from '../simulation';
export const tileSize = {
    width: 16,
    height: 12
};
export const viewportSize = {
    width: 11,
    height: 11
};
export const viewportCenter = {
    x: 5, y: 5
};
const quantization = 8;
const scenes = [sidebarScene, viewportScene, menuScene, titleScene];
export const config = {
    resourceMap, tileSize, quantization, scenes, simulation: simulation(12345)
};
//# sourceMappingURL=index.js.map