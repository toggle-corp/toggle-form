export const internal = Symbol('Internal Error');

type Intersects<A, B> = A extends B ? true : never;

export type Maybe<T> = T | undefined | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialForm<T, J extends string = 'uuid'> = T extends object ? (
    T extends (infer K)[] ? (
        PartialForm<K, J>[]
    ) : (
        Intersects<J, keyof T> extends true ? (
            { [P in Exclude<keyof T, J>]?: PartialForm<T[P], J> }
            & Pick<T, keyof T & J>
        ) : (
            { [P in keyof T]?: PartialForm<T[P], J> }
        )
    )
) : T;

// eslint-disable-next-line @typescript-eslint/ban-types
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

export type SetValueArg<T> = T | ((value: T | undefined) => T);
// NOTE: no undefined because we know the base value is always defined
export type SetBaseValueArg<T> = T | ((value: T) => T);

export type EntriesAsList<T> = {
    [K in keyof T]-?: [SetValueArg<T[K]>, K, ...unknown[]];
}[keyof T];

export type EntriesAsKeyValue<T> = {
    [K in keyof T]: {key: K, value: SetValueArg<T[K]> };
}[keyof T];
