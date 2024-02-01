export type DeepPartial<T> = T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]>; }
    : T;

// Removes readonly from all properties
export type DeepWriteable<T> = T extends object 
    ? { -readonly [P in keyof T]: DeepWriteable<T[P]> }
    : T;
