import { internal } from './types';

export type Schema<T, V = T, C = undefined> = (
    Exclude<T, undefined> extends unknown[]
        ? ArraySchema<Exclude<T, undefined>[number], V, C> | LiteralSchema<T, V, C>
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<T, undefined> extends object
                ? ObjectSchema<Exclude<T, undefined>, V, C> | LiteralSchema<T, V, C>
                : LiteralSchema<T, V, C>
          )
);

export type LiteralSchema<T, V = T, C = undefined> = (
    (value: T, baseValue: V, context: C) => string | undefined
)[];

export type ArraySchema<T, V = T, C = undefined> = {
    validation?: (value: T[] | undefined, allValue: V, context: C) => string | undefined;
    member: (value: T, allValue: V, context: C) => Schema<T, V, C>;
    keySelector: (value: T) => string | number;
}

export type ObjectSchema<T, V = T, C = undefined> = {
    validation?: (value: T | undefined, allValue: V, context: C) => string | undefined;
    fields: (value: T | undefined, allValue: V, context: C) => (
        { [K in keyof T]: Schema<T[K], V, C> }
    );
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

export function accumulateValues<T, C>(
    obj: T,
    schema: Schema<T, T, C>,
    settings?: { nullable: boolean },
    // FIXME: accumulateValues also requires context
): T;

export function accumulateErrors<T, C>(
    obj: T,
    schema: Schema<T, T, C>,
    baseValue: T,
    context?: C,
): Error<T> | undefined;

export function accumulateDifferentialErrors<T, C>(
    oldObj: T,
    newObj: T,
    oldError: Error<T> | undefined,
    schema: Schema<T, T, C>,
    baseValue: T,
    // FIXME: move this below context
    force = false,
    context: C,
): Error<T> | undefined;

export function analyzeErrors<T>(
    errors: ArrayError<T> | ObjectError<T> | LeafError
): boolean;
