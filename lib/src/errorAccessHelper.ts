import { isNotDefined } from '@togglecorp/fujs';
import { nonFieldError } from './types';
import type { ObjectError, ArrayError } from './schema';

export function getErrorObject<T>(
    value: ObjectError<T> | string | undefined | null,
): ObjectError<T> | undefined
export function getErrorObject<T>(
    value: ArrayError<T> | string | undefined | null,
): ArrayError<T> | undefined
export function getErrorObject<T>(
    value: ArrayError<T> | ObjectError<T> | string | undefined | null,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    if (typeof value === 'string') {
        // FIXME: memoize this
        return {
            [nonFieldError]: value,
        };
    }
    return value;
}

export function getErrorString<T>(
    value: ArrayError<T> | ObjectError<T> | string | undefined | null,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    if (typeof value === 'string') {
        return value;
    }
    return value[nonFieldError];
}
