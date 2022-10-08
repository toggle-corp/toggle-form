import {
    requiredCondition,
    requiredListCondition,
    requiredStringCondition,
    blacklistCondition,
    whitelistCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
    greaterThanCondition,
    smallerThanCondition,
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
    integerCondition,
    emailCondition,
    urlCondition,
} from './validation';

test('test required condition', () => {
    expect(requiredCondition(null)).toBe('The field is required');
    expect(requiredCondition(undefined)).toBe('The field is required');
    expect(requiredCondition(true)).toBe(undefined);
    expect(requiredCondition(false)).toBe(undefined);
    expect(requiredCondition([true])).toBe(undefined);
    expect(requiredCondition([false])).toBe(undefined);
    expect(requiredCondition([])).toBe(undefined);
    expect(requiredCondition('')).toBe(undefined);
    expect(requiredCondition(0)).toBe(undefined);
    expect(requiredCondition('hari')).toBe(undefined);
    expect(requiredCondition({})).toBe(undefined);
});

test('test required list condition', () => {
    expect(requiredListCondition(null)).toBe('The field is required');
    expect(requiredListCondition(undefined)).toBe('The field is required');
    expect(requiredListCondition([])).toBe('The field is required');
    expect(requiredListCondition([true])).toBe(undefined);
    expect(requiredListCondition([false])).toBe(undefined);
    expect(requiredListCondition([undefined])).toBe(undefined);
    expect(requiredListCondition([null])).toBe(undefined);
    expect(requiredListCondition([0])).toBe(undefined);
    expect(requiredListCondition(['hari'])).toBe(undefined);
});

test('test required string condition', () => {
    expect(requiredStringCondition(null)).toBe('The field is required');
    expect(requiredStringCondition(undefined)).toBe('The field is required');
    expect(requiredStringCondition('')).toBe('The field is required');
    expect(requiredStringCondition(' ')).toBe('The field is required');
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

test('test length greater than condition', () => {
    const lengthGreaterThanConditionInstance = lengthGreaterThanCondition(4);
    expect(lengthGreaterThanConditionInstance(null)).toBe(undefined);
    expect(lengthGreaterThanConditionInstance(undefined)).toBe(undefined);
    expect(lengthGreaterThanConditionInstance('')).toBe('Length must be greater than 4');
    expect(lengthGreaterThanConditionInstance('Say')).toBe('Length must be greater than 4');
    expect(lengthGreaterThanConditionInstance('Stay')).toBe('Length must be greater than 4');
    expect(lengthGreaterThanConditionInstance('Staying')).toBe(undefined);
});

test('test length smaller than condition', () => {
    const lengthSmallerThanConditionInstance = lengthSmallerThanCondition(4);
    expect(lengthSmallerThanConditionInstance(null)).toBe(undefined);
    expect(lengthSmallerThanConditionInstance(undefined)).toBe(undefined);
    expect(lengthSmallerThanConditionInstance('')).toBe(undefined);
    expect(lengthSmallerThanConditionInstance('Coffee')).toBe('Length must be smaller than 4');
    expect(lengthSmallerThanConditionInstance('Stay')).toBe('Length must be smaller than 4');
    expect(lengthSmallerThanConditionInstance('Sky')).toBe(undefined);
});

test('test greater than condition', () => {
    const greaterThanConditionInstance = greaterThanCondition(10);
    expect(greaterThanConditionInstance(null)).toBe(undefined);
    expect(greaterThanConditionInstance(undefined)).toBe(undefined);
    expect(greaterThanConditionInstance(3)).toBe('Field must be greater than 10');
    expect(greaterThanConditionInstance(10)).toBe('Field must be greater than 10');
    expect(greaterThanConditionInstance(11)).toBe(undefined);
});

test('test smaller than condition', () => {
    const smallerThanConditionInstance = smallerThanCondition(10);
    expect(smallerThanConditionInstance(null)).toBe(undefined);
    expect(smallerThanConditionInstance(undefined)).toBe(undefined);
    expect(smallerThanConditionInstance(30)).toBe('The field must be smaller than 10');
    expect(smallerThanConditionInstance(10)).toBe('The field must be smaller than 10');
    expect(smallerThanConditionInstance(9)).toBe(undefined);
});

test('test greater than or equal to condition', () => {
    const greaterThanOrEqualToConditionInstance = greaterThanOrEqualToCondition(10);
    expect(greaterThanOrEqualToConditionInstance(null)).toBe(undefined);
    expect(greaterThanOrEqualToConditionInstance(undefined)).toBe(undefined);
    expect(greaterThanOrEqualToConditionInstance(3)).toBe('The field must be greater than or equal to 10');
    expect(greaterThanOrEqualToConditionInstance(10)).toBe(undefined);
    expect(greaterThanOrEqualToConditionInstance(11)).toBe(undefined);
});

test('test less than or equal to condition', () => {
    const lessThanOrEqualToConditionInstance = lessThanOrEqualToCondition(10);
    expect(lessThanOrEqualToConditionInstance(null)).toBe(undefined);
    expect(lessThanOrEqualToConditionInstance(undefined)).toBe(undefined);
    expect(lessThanOrEqualToConditionInstance(30)).toBe('The field must be smaller than or equal to 10');
    expect(lessThanOrEqualToConditionInstance(10)).toBe(undefined);
    expect(lessThanOrEqualToConditionInstance(9)).toBe(undefined);
});

test('test integer condition', () => {
    expect(integerCondition(null)).toBe(undefined);
    expect(integerCondition(undefined)).toBe(undefined);
    expect(integerCondition(-12)).toBe(undefined);
    expect(integerCondition(12)).toBe(undefined);
    expect(integerCondition(1.2)).toBe('The field must be an integer');
    expect(integerCondition(-1.2)).toBe('The field must be an integer');
    expect(integerCondition(0)).toBe(undefined);
    expect(integerCondition(0.0)).toBe(undefined);
    expect(integerCondition(NaN)).toBe('The field must be an integer');
});

test('test email condition', () => {
    expect(emailCondition(null)).toBe(undefined);
    expect(emailCondition(undefined)).toBe(undefined);
    expect(emailCondition('')).toBe(undefined);
    expect(emailCondition('hari-bahadur@gmail.com')).toBe(undefined);
    expect(emailCondition('hari-bahadur@gmail')).toBe('The field must be a valid email');
    expect(emailCondition('hari-bahadur.com')).toBe('The field must be a valid email');
    expect(emailCondition('hari-bahadur')).toBe('The field must be a valid email');
});

test('test url condition', () => {
    expect(urlCondition(null)).toBe(undefined);
    expect(urlCondition(undefined)).toBe(undefined);
    expect(urlCondition('')).toBe(undefined);
    expect(urlCondition('https://www.google.com')).toBe(undefined);
    expect(urlCondition('https://google')).toBe('The field must be a valid url');
    expect(urlCondition('google.com')).toBe('The field must be a valid url');
    expect(urlCondition('www.google.com')).toBe('The field must be a valid url');
    expect(urlCondition('google')).toBe('The field must be a valid url');
    expect(urlCondition('https:www.google.com')).toBe('The field must be a valid url');
});
