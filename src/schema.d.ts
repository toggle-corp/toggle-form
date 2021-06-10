import { PurgeNull } from './types';

export type Schema<T> = (
    Exclude<T, undefined> extends unknown[]
        ? ArraySchema<Exclude<T, undefined>[number]> | LiteralSchema<T>
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<T, undefined> extends object
                ? ObjectSchema<Exclude<T, undefined>> | LiteralSchema<T>
                : LiteralSchema<T>
          )
);

export type LiteralSchema<T> = ((value: T) => string | undefined)[];

export type ArraySchema<T> = {
    validation?: (value: T[] | undefined) => string | undefined;
    member: (value: T) => Schema<T>;
    keySelector: (value: T) => string | number;
}

export type ObjectSchema<T> = {
    validation?: (value: T | undefined) => string | undefined;
    fields: (value: T | undefined) => ({ [K in keyof T]: Schema<T[K]> });
}

export type Error<T> = (
    Exclude<T, undefined> extends unknown[]
        ? ArrayError<Exclude<T, undefined>[number]>
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<T, undefined> extends object
                ? ObjectError<Exclude<T, undefined>>
                : LeafError
          )
);

export type LeafError = string | undefined;

export type ArrayError<T> = {
    $internal?: string;
    members?: {
        [key: string]: Error<T> | undefined;
    }
};

export type ObjectError<T> = {
    $internal?: string;
    fields?: {
        [K in keyof T]?: Error<T[K]> | undefined;
    }
};

export function accumulateValues<T>(
    obj: T,
    schema: Schema<T>,
    settings?: { nullable: boolean },
): T;

export function accumulateErrors<T>(
    obj: T,
    schema: Schema<T>,
): Error<T> | undefined;

export function accumulateDifferentialErrors<T>(
    oldObj: T,
    newObj: T,
    oldError: Error<T> | undefined,
    schema: Schema<T>,
): Error<T> | undefined;

export function analyzeErrors<T>(errors: ArrayError<T> | ObjectError<T> | LeafError): boolean;

export function removeNull<T>(data: T | undefined | null): PurgeNull<T>;
