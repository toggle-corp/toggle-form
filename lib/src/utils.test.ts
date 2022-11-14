import {
    hasNoKeys,
    hasNoValues,
    isDefinedString,
    isLocalUrl,
    isValidUrl,
    isDefined,
    isCallable,
} from './utils';

test('test isLocalUrl condition', () => {
    expect(isLocalUrl('https://localhost:3000/')).toBe(true);
    expect(isLocalUrl('https://google.com')).toBe(false);
    expect(isLocalUrl('https://www.localhost.com')).toBe(false);
    expect(isLocalUrl('localhost.com')).toBe(false);
    expect(isLocalUrl('')).toBe(false);
    expect(isLocalUrl('localhost')).toBe(false);
});

test('test isValidUrl condition', () => {
    expect(isValidUrl(undefined)).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('google')).toBe(false);
    expect(isValidUrl('google.com')).toBe(false);
    expect(isValidUrl('www.google.com')).toBe(false);
    expect(isValidUrl('https://www.google.com')).toBe(true);
    expect(isValidUrl('https://www.google.com#page=1')).toBe(true);
    expect(isValidUrl('https://www.google.com?page=1&referrer=idk')).toBe(true);
    expect(isValidUrl('https://localhost:3000/')).toBe(true);
});

test('test isDefined condition', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(Number.NaN)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined('Hello World!')).toBe(true);
    expect(isDefined([])).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(40)).toBe(true);
    expect(isDefined(-40)).toBe(true);
    expect(isDefined(1.2)).toBe(true);
});

test('test isDefinedString condition', () => {
    expect(isDefinedString(null)).toBe(false);
    expect(isDefinedString(undefined)).toBe(false);
    expect(isDefinedString('')).toBe(false);
    expect(isDefinedString(' ')).toBe(false);
    expect(isDefinedString('Hello World!')).toBe(true);
});

test('test hasNoKeys condition', () => {
    expect(hasNoKeys(null)).toBe(true);
    expect(hasNoKeys(undefined)).toBe(true);
    expect(hasNoKeys({})).toBe(true);
    expect(hasNoKeys({
        1: 'one',
        2: 'two',
    })).toBe(false);
    expect(hasNoKeys({
        1: '',
        2: [],
        3: {},
    })).toBe(false);
    expect(hasNoKeys({
        1: -1.2,
        2: 24,
        3: {},
        4: null,
        5: undefined,
    })).toBe(false);
    expect(hasNoKeys({
        1: null,
    })).toBe(false);
    expect(hasNoKeys({
        1: undefined,
    })).toBe(false);
});

test('test hasNoValues condition', () => {
    expect(hasNoValues(null)).toBe(true);
    expect(hasNoValues(undefined)).toBe(true);
    expect(hasNoValues([])).toBe(true);
    expect(hasNoValues([null, undefined])).toBe(true);
    expect(hasNoValues([null])).toBe(true);
    expect(hasNoValues([undefined])).toBe(true);

    expect(hasNoValues([0])).toBe(false);
    expect(hasNoValues(['hello', 'world'])).toBe(false);
    expect(hasNoValues(['', null, undefined])).toBe(false);
    expect(hasNoValues([[], [], []])).toBe(false);
    expect(hasNoValues([{}, {}])).toBe(false);
});

test('test isCallable', () => {
    expect(isCallable(null)).toBe(false);
    expect(isCallable(undefined)).toBe(false);
    expect(isCallable(0)).toBe(false);
    expect(isCallable('function')).toBe(false);
    expect(isCallable([])).toBe(false);
    expect(isCallable({})).toBe(false);
    expect(isCallable(() => true)).toBe(true);
    function getTrue() {
        return true;
    }
    expect(isCallable(getTrue)).toBe(true);
    function noOp() {
        console.warn('No operation');
    }
    expect(isCallable(noOp)).toBe(true);
});
