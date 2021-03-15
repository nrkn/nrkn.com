import { GameState } from '../state/types';
export interface Simulation {
    state: GameState;
    action: (type: SimulationActionType, ...args: any[]) => void;
}
export declare type SimulationActionType = ('up' | 'down' | 'left' | 'right' | 'get' | 'use' | 'search' | 'disarm' | 'rest' | 'sleep' | 'cast');
