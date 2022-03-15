import { isDefined } from '@togglecorp/fujs';
import {
    hasNoKeys,
    isDefinedString,
    isLocalUrl,
    isValidUrl,
} from './utils';

test('test isLocalUrl condition', () => {
    expect(isLocalUrl('https://localhost:3000/')).toBe(true);
    expect(isLocalUrl('https://www.localhost.com')).toBe(false);
    expect(isLocalUrl('localhost.com')).toBe(false);
    expect(isLocalUrl('')).toBe(false);
    expect(isLocalUrl('random-string')).toBe(false);
});

test('test isValidUrl condition', () => {
    expect(isValidUrl(undefined)).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('google')).toBe(false);
    expect(isValidUrl('google.com')).toBe(false);
    expect(isValidUrl('www.google.com')).toBe(false);
    expect(isValidUrl('https://www.google.com')).toBe(true);
});

test('test isDefined condition', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined('')).toBe(false);
    expect(isDefined('Hello jest')).toBe(true);
    expect(isDefined(40)).toBe(true);
    expect(isDefined(-40)).toBe(true);
    expect(isDefined(1.2)).toBe(true);
});

test('test isDefinedString condition', () => {
    expect(isDefinedString(null)).toBe(false);
    expect(isDefinedString(undefined)).toBe(false);
    expect(isDefinedString('')).toBe(false);
    expect(isDefinedString('Hello jest')).toBe(true);
});

test('test hasNoKeys condition', () => {
    expect(hasNoKeys(null)).toBe(true);
    expect(hasNoKeys(undefined)).toBe(true);
    expect(hasNoKeys({
        a: 'some string',
        b: 24,
    })).toBe(false);
});
