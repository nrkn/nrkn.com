export interface RandomNumber {
    (): number;
}
export interface RandInt {
    (exclMax: number): number;
}
export interface Pick {
    <T>(arr: T[]): T;
}
export interface PickClt {
    <T>(arr: T[], variance?: number): T;
}
export interface Clt {
    (exclMax: number, variance?: number): number;
}
export interface Random {
    next: RandomNumber;
    randInt: RandInt;
    pick: Pick;
    pickDice: PickClt;
    dice: Clt;
}
