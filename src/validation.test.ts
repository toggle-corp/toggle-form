import {
    requiredCondition,
    requiredListCondition,
    requiredStringCondition,
    blacklistCondition,
    whitelistCondition,
} from './validation';

test('test required condition', () => {
    expect(requiredCondition(null)).toBe('The field is required');
    expect(requiredCondition(undefined)).toBe('The field is required');
    expect(requiredCondition([])).toBe(undefined);
    expect(requiredCondition('')).toBe(undefined);
});

test('test required list condition', () => {
    expect(requiredListCondition(null)).toBe('The field is required');
    expect(requiredListCondition(undefined)).toBe('The field is required');
    expect(requiredListCondition([])).toBe('The field is required');
    expect(requiredListCondition(['hari'])).toBe(undefined);
});

test('test required string condition', () => {
    expect(requiredStringCondition(null)).toBe('The field is required');
    expect(requiredStringCondition(undefined)).toBe('The field is required');
    expect(requiredStringCondition('')).toBe('The field is required');
    expect(requiredStringCondition('hari')).toBe(undefined);
});

test('test whitelist condition', () => {
    const whitelistConditionInstance = whitelistCondition(['ram', 'laxman']);
    expect(whitelistConditionInstance(null)).toBe(undefined);
    expect(whitelistConditionInstance(undefined)).toBe(undefined);
    expect(whitelistConditionInstance('ram')).toBe(undefined);
    expect(whitelistConditionInstance('laxman')).toBe(undefined);
    expect(whitelistConditionInstance('rawan')).toBe('The field cannot be rawan');
});

test('test blacklist condition', () => {
    const blacklistConditionInstance = blacklistCondition(['ram', 'laxman']);
    expect(blacklistConditionInstance(null)).toBe(undefined);
    expect(blacklistConditionInstance(undefined)).toBe(undefined);
    expect(blacklistConditionInstance('ram')).toBe('The field cannot be ram');
    expect(blacklistConditionInstance('laxman')).toBe('The field cannot be laxman');
    expect(blacklistConditionInstance('rawan')).toBe(undefined);
});
