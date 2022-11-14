import {
    getErrorObject,
    getErrorString,
} from './errorAccessHelper';
import { nonFieldError } from './types';

test('test getErrorObject condition', () => {
    expect(getErrorObject(null)).toBe(undefined);
    expect(getErrorObject(undefined)).toBe(undefined);
    expect(getErrorObject('We have some error!')).toStrictEqual({
        [nonFieldError]: 'We have some error!',
    });
    expect(getErrorObject({
        name: 'This is required',
        age: 'This is required',
    })).toStrictEqual({
        name: 'This is required',
        age: 'This is required',
    });
    expect(getErrorObject({
        roll: undefined,
        age: 'This is required',
    })).toStrictEqual({
        roll: undefined,
        age: 'This is required',
    });
    expect(getErrorObject({
        [nonFieldError]: 'We have some error!',
        name: 'This is required',
        age: 'This is required',
    })).toStrictEqual({
        [nonFieldError]: 'We have some error!',
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
        [nonFieldError]: 'We have some error',
    })).toStrictEqual('We have some error');
});
