import { SceneIO } from '../../engine/scene/types';
export declare const LogFactory: (seed?: number) => {
    reset: (newSeed?: number) => void;
    add: (item: string | number[]) => void;
    replay: (io: SceneIO) => void;
    getSeed: () => number;
};
