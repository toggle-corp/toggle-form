// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialForm<T> = T extends object ? (
    T extends (infer K)[] ? (
        PartialForm<K>[]
    ) : (
        T extends { uuid: string } ? (
            { [P in Exclude<keyof T, 'uuid'>]?: PartialForm<T[P]> }
            & Pick<T, 'uuid'>
        ) : (
            { [P in keyof T]?: PartialForm<T[P]> }
        )
    )
) : T;

export type PurgeNull<T> = (
    T extends (infer Z)[]
        ? PurgeNull<Z>[]
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            T extends object
                ? { [K in keyof T]: PurgeNull<T[K]> }
                : (T extends null ? undefined : T)
        )
)

export type StateArg<T> = T | ((value: T) => T);

export type EntriesAsList<T> = {
    [K in keyof T]-?: [StateArg<T[K]>, K, ...unknown[]];
}[keyof T];

export type EntriesAsKeyValue<T> = {
    [K in keyof T]: {key: K, value: StateArg<T[K]> };
}[keyof T];
