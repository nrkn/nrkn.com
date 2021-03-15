import { LogDataItem } from '../engine/log/types';
export declare type FullScreenMessage = ['toggleFullscreen'];
export declare type LogMessage = ['log', LogDataItem];
export declare type Message = FullScreenMessage | LogMessage;
