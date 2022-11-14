import {
    analyzeErrors,
} from './schema';
import {
    nonFieldError,
} from './types';

test('Test analyzeErrors', () => {
    expect(analyzeErrors(null)).toBe(false);
    expect(analyzeErrors('This is required')).toBe(true);
    expect(analyzeErrors({})).toBe(false);
    expect(analyzeErrors({ [nonFieldError]: 'This is required' })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
        fieldTwo: 'There is an error',
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {},
    })).toBe(false);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {
            [nonFieldError]: 'This is required',
        },
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
    })).toBe(false);
});
