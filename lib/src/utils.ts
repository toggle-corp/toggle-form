import {
    isNotDefined,
    isValidUrl as isValidRemoteUrl,
} from '@togglecorp/fujs';
import {
    Maybe,
} from './types';

// FIXME: check if this can be done without backward referencing
// NOTE: used for validation
const localhostRegex = /(?<=\/\/)localhost(?=[:/]|$)/;
export function isLocalUrl(url: string) {
    return localhostRegex.test(url);
}

// FIXME: move this to fujs
// NOTE: used for validation
export function isValidUrl(url: string | undefined): url is string {
    if (!url) {
        return false;
    }
    const sanitizedUrl = url.replace(localhostRegex, 'localhost.com');
    return isValidRemoteUrl(sanitizedUrl);
}

// NOTE: we are not using isDefined from fujs because it treats NaN as not defined
// NOTE: used for validation
export function isDefined<T>(value: Maybe<T>): value is T {
    return value !== undefined && value !== null;
}

// NOTE: used for validation
export function isDefinedString(value: Maybe<string>): value is string {
    return isDefined(value) && value.trim() !== '';
}

export function hasNoKeys(obj: Maybe<object>) {
    return (
        isNotDefined(obj)
        || (Object.keys(obj).length + Object.getOwnPropertySymbols(obj).length) === 0
    );
}

export function hasNoValues(array: Maybe<unknown[]>) {
    return (
        isNotDefined(array)
        || array.length <= 0
        || array.every((e) => isNotDefined(e))
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args:any[]) => any;
export function isCallable<T, X extends Func>(value: T | X): value is X {
    return typeof value === 'function';
}
