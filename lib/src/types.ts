export const nonFieldError = Symbol('Non Field Error');

export const fieldDependencies = Symbol('Field Dependencies');

export const undefinedValue = Symbol('Undefined Value');
export const nullValue = Symbol('Undefined Value');

// declare const undefindValue: unique symbol;
// declare const nullValue: unique symbol;

type Intersects<A, B> = A extends B ? true : never;

export type Maybe<T> = T | undefined | null;

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

export type PurgeNull<T> = (
    T extends (infer Z)[]
        ? PurgeNull<Z>[]
        : (
            T extends object
                ? { [K in keyof T]: PurgeNull<T[K]> }
                : (T extends null ? undefined : T)
        )
)

export type SetValueArg<T> = T | ((value: T | undefined) => T);
// NOTE: no undefined because we know the base value is always defined
export type SetBaseValueArg<T> = T | ((value: T) => T);

export type SetErrorArg<T> = T | undefined | ((value: T | undefined) => (T | undefined));

export type EntriesAsList<T> = {
    [K in keyof T]-?: [SetValueArg<T[K]>, K, ...unknown[]];
}[keyof T];

export type EntriesAsKeyValue<T> = {
    [K in keyof T]: {key: K, value: SetValueArg<T[K]> };
}[keyof T];
