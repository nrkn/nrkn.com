export interface Grid<T> {
    width: number;
    height: number;
    data: T[];
}
export declare type GridCallback<T> = (cell: T, x: number, y: number) => void;
