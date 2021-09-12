import { isFalsy, isValidUrl as isValidRemoteUrl } from '@togglecorp/fujs';
import { SetValueArg, SetBaseValueArg, Maybe } from './types';

// NOTE: used for validation
const localhostRegex = /(?<=\/\/)localhost(?=[:/]|$)/;
export function isLocalUrl(url: string) {
    return localhostRegex.test(url);
}

// NOTE: used for validation
export function isValidUrl(url: string | undefined): url is string {
    if (!url) {
        return false;
    }
    const sanitizedUrl = url.replace(localhostRegex, 'localhost.com');
    return isValidRemoteUrl(sanitizedUrl);
}

// NOTE: used for validation
export function isDefined<T>(value: Maybe<T>): value is T {
    return value !== undefined && value !== null;
}

// NOTE: used for validation
export function isDefinedString(value: Maybe<string>): value is string {
    return isDefined(value) && value.trim() !== '';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function hasNoKeys(obj: Maybe<object>) {
    return (
        isFalsy(obj)
        || (Object.keys(obj).length + Object.getOwnPropertySymbols(obj).length) === 0
    );
}

export function hasNoValues(array: Maybe<unknown[]>) {
    return (
        isFalsy(array)
        || array.length <= 0
        || array.every((e) => isFalsy(e))
    );
}

export function isCallable<T>(value: SetValueArg<T>): value is (oldVal: T | undefined) => T {
    return typeof value === 'function';
}

export function isBaseCallable<T>(value: SetBaseValueArg<T>): value is (oldVal: T) => T {
    return typeof value === 'function';
}
