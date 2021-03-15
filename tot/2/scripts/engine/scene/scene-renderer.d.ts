import { Rect } from '../geometry/types';
import { ResourceDataMap } from '../resource/types';
export declare const sceneRenderer: (resources: ResourceDataMap, tileRect: Rect) => {
    pixelRect: Rect;
    imageData: ImageData;
    renderer: import("../renderer/types").Renderer;
};
