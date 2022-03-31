import {
    getErrorObject,
    getErrorString,
} from './errorAccessHelper';
import { internal } from './types';

test('test getErrorObject condition', () => {
    expect(getErrorObject(null)).toBe(undefined);
    expect(getErrorObject(undefined)).toBe(undefined);
    expect(getErrorObject('some string')).toStrictEqual({
        [internal]: 'some string',
    });
    expect(getErrorObject({
        nameError: 'This is required',
        ageError: 'This is required',
    })).toStrictEqual({
        nameError: 'This is required',
        ageError: 'This is required',
    });
    expect(getErrorObject({
        nameError: null,
        rollError: undefined,
        ageError: 'This is required',
    })).toStrictEqual({
        nameError: null,
        rollError: undefined,
        ageError: 'This is required',
    });
});

test('test getErrorString condition', () => {
    expect(getErrorString(null)).toBe(undefined);
    expect(getErrorString(undefined)).toBe(undefined);
    expect(getErrorString('some random string')).toBe('some random string');
    expect(getErrorString({
        [internal]: 'some random string',
    })).toStrictEqual('some random string');
});
