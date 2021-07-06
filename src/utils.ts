import { isValidUrl as isValidRemoteUrl, isNotDefined } from '@togglecorp/fujs';
import { SetValueArg, internal } from './types';
import type { ObjectError, ArrayError } from './schema';

const localhostRegex = /(?<=\/\/)localhost(?=[:/]|$)/;

// FIXME: move this to another helper
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

// FIXME: move this to another helper
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

export function isLocalUrl(url: string) {
    return localhostRegex.test(url);
}

export function isValidUrl(url: string | undefined): url is string {
    if (!url) {
        return false;
    }
    const sanitizedUrl = url.replace(localhostRegex, 'localhost.com');
    return isValidRemoteUrl(sanitizedUrl);
}

export function isCallable<T>(value: SetValueArg<T>): value is (oldVal: T) => T {
    return typeof value === 'function';
}
