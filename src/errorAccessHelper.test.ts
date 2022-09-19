import {
    getErrorObject,
    getErrorString,
} from './errorAccessHelper';
import { internal } from './types';

test('test getErrorObject condition', () => {
    expect(getErrorObject(null)).toBe(undefined);
    expect(getErrorObject(undefined)).toBe(undefined);
    expect(getErrorObject('We have some error!')).toStrictEqual({
        [internal]: 'We have some error!',
    });
    expect(getErrorObject({
        name: 'This is required',
        age: 'This is required',
    })).toStrictEqual({
        name: 'This is required',
        age: 'This is required',
    });
    expect(getErrorObject({
        name: null,
        roll: undefined,
        age: 'This is required',
    })).toStrictEqual({
        name: null,
        roll: undefined,
        age: 'This is required',
    });
    expect(getErrorObject({
        [internal]: 'We have some error!',
        name: 'This is required',
        age: 'This is required',
    })).toStrictEqual({
        [internal]: 'We have some error!',
        name: 'This is required',
        age: 'This is required',
    });
});

test('test getErrorString condition', () => {
    expect(getErrorString(null)).toBe(undefined);
    expect(getErrorString(undefined)).toBe(undefined);
    expect(getErrorString({})).toStrictEqual(undefined);
    expect(getErrorString({
        name: 'This is required',
        age: 'This is required',
    })).toStrictEqual(undefined);
    expect(getErrorString('We have some error!')).toBe('We have some error!');
    expect(getErrorString({
        [internal]: 'We have some error',
    })).toStrictEqual('We have some error');
});
