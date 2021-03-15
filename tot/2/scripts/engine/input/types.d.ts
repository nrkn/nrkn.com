export interface KeyboardInput {
    (type: string): void;
}
export interface TouchInput {
    (tx: number, ty: number): void;
}
