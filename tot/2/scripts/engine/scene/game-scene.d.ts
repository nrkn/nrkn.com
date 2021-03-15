import { SceneRepository } from './types';
import { Config } from '../config/types';
import { Message } from '../../client/types';
import { ResourceDataMap } from '../resource/types';
export declare const gameSceneRepository: <TSimulation>(config: Config<TSimulation>, resources: ResourceDataMap, browserMessage: (...args: Message) => void) => SceneRepository<TSimulation>;
