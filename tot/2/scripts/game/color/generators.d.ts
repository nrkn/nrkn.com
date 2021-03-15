import { Random } from '../../engine/random/types';
export declare const RandomColors: (random: Random) => {
    randomSkin: () => [number, number, number];
    randomClothes: () => [number, number, number];
    randomBright: (brightness: number) => [number, number, number];
};
