import { isNotDefined } from '@togglecorp/fujs';
import { internal } from './types';
import type { ObjectError, ArrayError } from './schema';

export function getErrorObject<T>(
    value: ObjectError<T> | string | undefined,
): ObjectError<T> | undefined
export function getErrorObject<T>(
    value: ArrayError<T> | string | undefined,
): ArrayError<T> | undefined
export function getErrorObject<T>(
    value: ArrayError<T> | ObjectError<T> | string | undefined,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    if (typeof value === 'string') {
        return {
            [internal]: value,
        };
    }
    return value;
}

export function getErrorString<T>(
    value: ArrayError<T> | ObjectError<T> | string | undefined,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    if (typeof value === 'string') {
        return value;
    }
    return value[internal];
}
