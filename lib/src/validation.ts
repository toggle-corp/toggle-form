import { isValidEmail, isInteger } from '@togglecorp/fujs';
import { isValidUrl, isDefined, isDefinedString } from './utils';
import { Maybe } from './types';

// ─── Simple validators ────────────────────────────────────────────────────────
// Used directly as `requiredValidation` or inside `validations: [...]`.

export function requiredCondition(value: unknown): string | undefined {
    return !isDefined(value)
        ? 'The field is required'
        : undefined;
}

export function requiredListCondition<T>(value: Maybe<T[]>): string | undefined {
    return !isDefined(value) || value.length === 0
        ? 'The field is required'
        : undefined;
}

export function requiredStringCondition(value: Maybe<string>): string | undefined {
    return !isDefinedString(value)
        ? 'The field is required'
        : undefined;
}

export function integerCondition(value: Maybe<number>): string | undefined {
    return isDefined(value) && !isInteger(value)
        ? 'The field must be an integer'
        : undefined;
}

export function emailCondition(value: Maybe<string>): string | undefined {
    return isDefinedString(value) && !isValidEmail(value)
        ? 'The field must be a valid email'
        : undefined;
}

export function urlCondition(value: Maybe<string>): string | undefined {
    return isDefinedString(value) && !isValidUrl(value)
        ? 'The field must be a valid url'
        : undefined;
}

// ─── Validator factories ──────────────────────────────────────────────────────
// The optional `message` parameter allows overriding the error string for
// translation support.  Pass a pre-translated string (e.g. from `t()`) or a
// function that receives the constraint value and returns a string.

export function blacklistCondition<T>(
    x: T[],
    message?: string | ((value: T) => string),
) {
    return (value: Maybe<T>): string | undefined => {
        if (!isDefined(value) || !x.includes(value)) return undefined;
        if (message) return typeof message === 'function' ? message(value) : message;
        return `The field cannot be ${value}`;
    };
}

export function whitelistCondition<T>(
    x: T[],
    message?: string | ((value: T) => string),
) {
    return (value: Maybe<T>): string | undefined => {
        if (!isDefined(value) || x.includes(value)) return undefined;
        if (message) return typeof message === 'function' ? message(value) : message;
        return `The field cannot be ${value}`;
    };
}

export function lengthGreaterThanCondition(
    x: number,
    message?: string | ((min: number) => string),
) {
    return (value: Maybe<string | unknown[]>): string | undefined => {
        if (!isDefined(value) || value.length > x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `Length must be greater than ${x}`;
    };
}

export function lengthSmallerThanCondition(
    x: number,
    message?: string | ((max: number) => string),
) {
    return (value: Maybe<string | unknown[]>): string | undefined => {
        if (!isDefined(value) || value.length < x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `Length must be smaller than ${x}`;
    };
}

export function greaterThanCondition(
    x: number,
    message?: string | ((min: number) => string),
) {
    return (value: Maybe<number>): string | undefined => {
        if (!isDefined(value) || value > x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `Field must be greater than ${x}`;
    };
}

export function smallerThanCondition(
    x: number,
    message?: string | ((max: number) => string),
) {
    return (value: Maybe<number>): string | undefined => {
        if (!isDefined(value) || value < x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `The field must be smaller than ${x}`;
    };
}

export function greaterThanOrEqualToCondition(
    x: number,
    message?: string | ((min: number) => string),
) {
    return (value: Maybe<number>): string | undefined => {
        if (!isDefined(value) || value >= x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `The field must be greater than or equal to ${x}`;
    };
}

export function lessThanOrEqualToCondition(
    x: number,
    message?: string | ((max: number) => string),
) {
    return (value: Maybe<number>): string | undefined => {
        if (!isDefined(value) || value <= x) return undefined;
        if (message) return typeof message === 'function' ? message(x) : message;
        return `The field must be smaller than or equal to ${x}`;
    };
}

// ─── Message-overridable factories for simple validators ──────────────────────
// Use these when you need a custom or translated message for validators that
// are normally used directly (not as factories).

export function createRequiredCondition(message: string) {
    return (value: unknown): string | undefined => (!isDefined(value) ? message : undefined);
}

export function createRequiredListCondition<T>(message: string) {
    return (value: Maybe<T[]>): string | undefined => (
        !isDefined(value) || value.length === 0 ? message : undefined
    );
}

export function createRequiredStringCondition(message: string) {
    return (value: Maybe<string>): string | undefined => (
        !isDefinedString(value) ? message : undefined
    );
}

export function createIntegerCondition(message: string) {
    return (value: Maybe<number>): string | undefined => (
        isDefined(value) && !isInteger(value) ? message : undefined
    );
}

export function createEmailCondition(message: string) {
    return (value: Maybe<string>): string | undefined => (
        isDefinedString(value) && !isValidEmail(value) ? message : undefined
    );
}

export function createUrlCondition(message: string) {
    return (value: Maybe<string>): string | undefined => (
        isDefinedString(value) && !isValidUrl(value) ? message : undefined
    );
}
