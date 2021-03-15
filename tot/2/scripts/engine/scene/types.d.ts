import { Message } from '../../client/types';
import { ResourceDataMap } from '../resource/types';
import { Rect } from '../geometry/types';
import { Config } from '../config/types';
export interface SceneFactory<TSimulation> {
    (repository: RepositoryApi<TSimulation>): Scene;
}
export interface SceneIO {
    input: (type: string, synthetic?: boolean) => void;
    tap: (tx: number, ty: number, synthetic?: boolean) => void;
    tick: (timestamp: number, synthetic?: boolean) => void;
    imageData: ImageData;
}
export interface Scene extends SceneIO {
    name: string;
    pixelRect: Rect;
    active: boolean;
    visible: boolean;
}
export interface RepositoryApi<TSimulation> {
    activate: (name: string) => void;
    deactivate: (name: string) => void;
    show: (name: string) => void;
    hide: (name: string) => void;
    dispatchTap: (name: string, tx: number, ty: number) => void;
    dispatchInput: (name: string, input: string) => void;
    config: Config<TSimulation>;
    resources: ResourceDataMap;
    browserMessage: (...args: Message) => void;
}
export interface SceneRepository<TSimulation> extends SceneIO, RepositoryApi<TSimulation> {
}
export interface Tick {
    (timestamp: number): void;
}
