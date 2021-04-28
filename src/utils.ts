import { isValidUrl as isValidRemoteUrl } from '@togglecorp/fujs';
import { StateArg } from './types';

const localhostRegex = /(?<=\/\/)localhost(?=[:/]|$)/;

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

export function isCallable<T>(value: StateArg<T>): value is (oldVal: T) => T {
    return typeof value === 'function';
}
