import { PurgeNull, internal } from './types';

export type Schema<T, V=T> = (
    Exclude<T, undefined> extends unknown[]
        ? ArraySchema<Exclude<T, undefined>[number]> | LiteralSchema<T, V>
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<T, undefined> extends object
                ? ObjectSchema<Exclude<T, undefined>> | LiteralSchema<T, V>
                : LiteralSchema<T, V>
          )
);

export type LiteralSchema<T, V> = ((value: T, baseValue: V) => string | undefined)[];

export type ArraySchema<T, V=T> = {
    validation?: (value: T[] | undefined) => string | undefined;
    member: (value: T) => Schema<T, V>;
    keySelector: (value: T) => string | number;
}

export type ObjectSchema<T, V=T> = {
    validation?: (value: T | undefined) => string | undefined;
    fields: (value: T | undefined) => ({ [K in keyof T]: Schema<T[K], V> });
    fieldDependencies?: (value: T | undefined) => ({ [K in keyof T]: (keyof T)[]});
}

export type Error<T> = (
    Exclude<T, undefined> extends unknown[]
        ? ArrayError<Exclude<T, undefined>[number]> | LeafError
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<T, undefined> extends object
                ? ObjectError<Exclude<T, undefined>> | LeafError
                : LeafError
        )
);

export type LeafError = string | undefined;

export type ArrayError<T> = {
    [key: string]: Error<T> | undefined;
} & { [internal]?: string };

export type ObjectError<T> = {
    [K in keyof T]?: Error<T[K]> | undefined;
} & { [internal]?: string }

export function accumulateValues<T>(
    obj: T,
    schema: Schema<T>,
    settings?: { nullable: boolean },
): T;

export function accumulateErrors<T>(
    obj: T,
    schema: Schema<T>,
    // value: T,
): Error<T> | undefined;

export function accumulateDifferentialErrors<T>(
    oldObj: T,
    newObj: T,
    oldError: Error<T> | undefined,
    schema: Schema<T>,
    // value: T,
): Error<T> | undefined;

export function analyzeErrors<T>(errors: ArrayError<T> | ObjectError<T> | LeafError): boolean;

export function removeNull<T>(data: T | undefined | null): PurgeNull<T>;
