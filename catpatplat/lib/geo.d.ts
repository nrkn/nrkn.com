type MapRecord = <T extends Record<string,number>>( s: T, options: Partial<T> ) => T

export declare const scale: MapRecord
export declare const translate: MapRecord
