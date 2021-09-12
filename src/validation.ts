import { isValidEmail, isInteger } from '@togglecorp/fujs';
import { isValidUrl, isDefined, isDefinedString } from './utils';
import { Maybe } from './types';

export function requiredCondition(value: unknown) {
    return !isDefined(value)
        ? 'The field is required'
        : undefined;
}

export function requiredListCondition<T>(value: Maybe<T[]>) {
    return !isDefined(value) || value.length === 0
        ? 'The field is required'
        : undefined;
}

export function requiredStringCondition(value: Maybe<string>) {
    return !isDefinedString(value)
        ? 'The field is required'
        : undefined;
}

export function blacklistCondition<T>(x: T[]) {
    return (value: Maybe<T>) => (
        isDefined(value) && x.includes(value)
            ? `The field cannot be ${value}`
            : undefined
    );
}

export function whitelistCondition<T>(x: T[]) {
    return (value: Maybe<T>) => (
        isDefined(value) && !x.includes(value)
            ? `The field cannot be ${value}`
            : undefined
    );
}

export function lengthGreaterThanCondition(x: number) {
    return (value: Maybe<string | unknown[]>) => (
        isDefined(value) && value.length <= x
            ? `Length must be greater than ${x}`
            : undefined
    );
}
export function lengthSmallerThanCondition(x: number) {
    // NOTE: isDefinedString is not really required here
    return (value: Maybe<string | unknown[]>) => (
        isDefined(value) && value.length >= x
            ? `Length must be smaller than ${x}`
            : undefined
    );
}

export function greaterThanCondition(x: number) {
    return (value: Maybe<number>) => (
        isDefined(value) && value <= x
            ? `Field must be greater than ${x}`
            : undefined
    );
}
export function smallerThanCondition(x: number) {
    return (value: Maybe<number>) => (
        isDefined(value) && value >= x
            ? `The field must be smaller than ${x}`
            : undefined
    );
}

export function greaterThanOrEqualToCondition(x: number) {
    return (value: Maybe<number>) => (
        isDefined(value) && value < x
            ? `The field must be greater than or equal to ${x}`
            : undefined
    );
}

export function lessThanOrEqualToCondition(x: number) {
    return (value: Maybe<number>) => (
        isDefined(value) && value > x
            ? `The field must be smaller than or equal to ${x}`
            : undefined
    );
}

export function integerCondition(value: Maybe<number>) {
    return isDefined(value) && !isInteger(value)
        ? 'The field must be an integer'
        : undefined;
}

export function emailCondition(value: Maybe<string>) {
    return isDefinedString(value) && !isValidEmail(value)
        ? 'The field must be a valid email'
        : undefined;
}

export function urlCondition(value: Maybe<string>) {
    return isDefinedString(value) && !isValidUrl(value)
        ? 'The field must be a valid url'
        : undefined;
}

export function forceNullType() {
    return undefined;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function forceEmptyArrayType(_: Maybe<any[]>) {
    return undefined;
}

export function defaultUndefinedType() {
    return undefined;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function defaultEmptyArrayType(_: Maybe<any[]>) {
    return undefined;
}
