import { ResourceMap } from '../resource/types';
import { Size } from '../geometry/types';
import { SceneFactory } from '../scene/types';
export interface Config<TSimulation> {
    resourceMap: ResourceMap;
    tileSize: Size;
    quantization: number;
    scenes: SceneFactory<TSimulation>[];
    simulation: TSimulation;
}
