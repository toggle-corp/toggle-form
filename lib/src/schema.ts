import {
    isObject,
    isNotDefined,
    findDifferenceInList,
    pick,
    unique,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    nonFieldError,
    fieldDependencies,
    undefinedValue,
    nullValue,
} from './types';
import {
    requiredCondition as genericRequiredCondition,
} from './validation';
import {
    hasNoKeys,
    hasNoValues,
} from './utils';

// ─── Error types ──────────────────────────────────────────────────────────────

export type LeafError = string | undefined;

export type ArrayError<Value> = {
    [key: string]: Error<Value> | undefined;
} & { [nonFieldError]?: string };

export type ObjectError<Value> = {
    [K in keyof Value]?: Error<Value[K]> | undefined;
} & { [nonFieldError]?: string };

export type Error<Value> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArrayError<Exclude<Value, undefined>[number]> | LeafError
        : (
            Exclude<Value, undefined> extends object
                ? ObjectError<Exclude<Value, undefined>> | LeafError
                : LeafError
        )
);

// ─── Schema types ─────────────────────────────────────────────────────────────

/**
 * Message overrides for built-in constraint validators.
 * Supply a pre-translated string (call `t()` at schema-creation time), or a
 * function that receives the constraint value so the message can be composed
 * dynamically (e.g. `(n) => t('maxLength', { count: n })`).
 */
export type LiteralSchemaMessages = Partial<{
    required: string;
    maxLength: string | ((n: number) => string);
    minLength: string | ((n: number) => string);
    max: string | ((n: number) => string);
    min: string | ((n: number) => string);
    integer: string;
}>;

export type LiteralSchema<Value, TopValue = Value, Context = undefined> = {
    // Validation
    required?: boolean;
    requiredValidation?: (value: Value, topValue: TopValue, context: Context) => string | undefined;

    // Value resolution
    forceValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue;
    defaultValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue;

    // Custom validation rules (run in order, stop at first error)
    validations?: ((value: Value, topValue: TopValue, context: Context) => string | undefined)[];

    /**
     * Built-in constraints — single source of truth.
     * Validated automatically by accumulateErrors; read from the schema to drive
     * input attributes (e.g. `maxLength` on a TextInput).
     */
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
    integer?: boolean;

    /**
     * Override error messages produced by built-in constraints and `required`.
     * Custom `requiredValidation` functions always take precedence over
     * `messages.required`.
     */
    messages?: LiteralSchemaMessages;
};

export type ArraySchema<Value, TopValue = Value, Context = undefined> = {
    validation?: (
        value: Value[] | undefined,
        topValue: TopValue,
        context: Context,
    ) => string | undefined;
    member: (
        value: Value,
        topValue: TopValue,
        context: Context,
    ) => Schema<Value, TopValue, Context>;
    keySelector: (value: Value) => string | number;

    // Value resolution
    forceValue?: NonNullable<Value[]> | typeof undefinedValue | typeof nullValue;
    defaultValue?: NonNullable<Value[]> | typeof undefinedValue | typeof nullValue;
};

export type ObjectSchema<Value, TopValue = Value, Context = undefined> = {
    validation?: (
        value: Value | undefined,
        topValue: TopValue,
        context: Context,
    ) => string | undefined;
    fields: (
        value: Value | undefined,
        topValue: TopValue,
        context: Context,
    ) => (
        { [K in keyof Value]: Schema<Value[K], TopValue, Context> }
        & { [fieldDependencies]?: { [K in keyof Value]?: (keyof Value)[] } }
    );

    // Value resolution
    forceValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue;
    defaultValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue;
};

export type Schema<Value, TopValue = Value, Context = undefined> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArraySchema<Exclude<Value, undefined>[number], TopValue, Context>
            | LiteralSchema<Value, TopValue, Context>
        : (
            Exclude<Value, undefined> extends object
                ? ObjectSchema<Exclude<Value, undefined>, TopValue, Context>
                    | LiteralSchema<Value, TopValue, Context>
                : LiteralSchema<Value, TopValue, Context>
          )
);

// ─── Visibility types ─────────────────────────────────────────────────────────

/**
 * A map of field visibilities for the direct children of an ObjectSchema.
 * `true` = visible, `false` = force-hidden (forceValue is nullValue or undefinedValue).
 */
export type VisibilityMap<Value extends object> = {
    [K in keyof Value]: boolean;
};

// ─── Constraint types ─────────────────────────────────────────────────────────

/**
 * The built-in constraints extracted from a single `LiteralSchema` field.
 * Useful for driving input attributes from the same source as validation rules.
 */
export type FieldConstraints = {
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
    integer?: boolean;
};

/**
 * A map of per-field constraints for all direct children of an ObjectSchema.
 * Fields without any constraints are omitted.
 */
export type ConstraintMap<Value extends object> = {
    [K in keyof Value]?: FieldConstraints;
};

// ─── Internal types used by the recursive implementation functions ─────────────
// These use `unknown` for value/context positions so the recursive impl
// functions don't need `any` casts on every call site.

type InternalValidationFn = (
    value: unknown,
    baseValue: unknown,
    context: unknown,
) => string | undefined;

type InternalFieldsResult = Record<string, InternalSchema> & {
    [fieldDependencies]?: Record<string, (string | number | symbol)[]>;
};

type InternalSchema = {
    // Shared
    forceValue?: unknown;
    defaultValue?: unknown;
    // ObjectSchema
    fields?: (obj: unknown, baseValue: unknown, context: unknown) => InternalFieldsResult;
    validation?: InternalValidationFn;
    // ArraySchema
    member?: (value: unknown, baseValue: unknown, context: unknown) => InternalSchema;
    keySelector?: (value: unknown) => string | number;
    // LiteralSchema
    required?: boolean;
    requiredValidation?: InternalValidationFn;
    validations?: InternalValidationFn[];
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
    integer?: boolean;
    messages?: LiteralSchemaMessages;
};

// Errors at the impl level: keyed by string (field name) or symbol (nonFieldError)
type InternalErrors = Record<string | symbol, unknown>;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isHiddenByForceValue(schema: { forceValue?: unknown }): boolean {
    return (
        isDefined(schema.forceValue)
        && (schema.forceValue === nullValue || schema.forceValue === undefinedValue)
    );
}

function resolveConstraintMessage(
    msg: string | ((n: number) => string) | undefined,
    n: number,
    fallback: string,
): string {
    if (msg === undefined) return fallback;
    return typeof msg === 'function' ? msg(n) : msg;
}

function validateConstraints(obj: unknown, schema: InternalSchema): string | undefined {
    // NOTE: skip only null/undefined here, NOT NaN. A NaN number is a present-but-invalid
    // value that must still fail the numeric/integer checks below. (fujs `isDefined` treats
    // NaN as not-defined, which is why the validation.ts factory validators deliberately use
    // the NaN-aware `isDefined` from ./utils — see utils.ts.)
    if (obj === undefined || obj === null) return undefined;

    const { messages } = schema;

    if (schema.maxLength !== undefined) {
        const len = typeof obj === 'string' || Array.isArray(obj) ? obj.length : undefined;
        if (len !== undefined && len > schema.maxLength) {
            return resolveConstraintMessage(
                messages?.maxLength,
                schema.maxLength,
                `Length must be no more than ${schema.maxLength}`,
            );
        }
    }

    if (schema.minLength !== undefined) {
        const len = typeof obj === 'string' || Array.isArray(obj) ? obj.length : undefined;
        if (len !== undefined && len < schema.minLength) {
            return resolveConstraintMessage(
                messages?.minLength,
                schema.minLength,
                `Length must be at least ${schema.minLength}`,
            );
        }
    }

    // NOTE: the range checks are written as the negation of the valid range (rather than
    // `obj > max` / `obj < min`) so that NaN — which compares false to everything — is
    // treated as a violation, consistent with the validation.ts numeric factory validators.
    if (schema.max !== undefined && typeof obj === 'number' && !(obj <= schema.max)) {
        return resolveConstraintMessage(
            messages?.max,
            schema.max,
            `The value must be no more than ${schema.max}`,
        );
    }

    if (schema.min !== undefined && typeof obj === 'number' && !(obj >= schema.min)) {
        return resolveConstraintMessage(
            messages?.min,
            schema.min,
            `The value must be at least ${schema.min}`,
        );
    }

    if (schema.integer && typeof obj === 'number' && !Number.isInteger(obj)) {
        return messages?.integer ?? 'The field must be an integer';
    }

    return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
    return value as unknown[];
}

// ─── accumulateValues implementation ─────────────────────────────────────────

function accumulateValuesImpl(
    obj: unknown,
    schema: InternalSchema,
    baseValue: unknown,
    context: unknown,
    settings: { nullable?: boolean },
): unknown {
    const { nullable = false } = settings;
    const {
        fields,
        member,
        keySelector,
    } = schema;

    if (isDefined(schema.forceValue)) {
        if (schema.forceValue === undefinedValue) return undefined;
        if (schema.forceValue === nullValue) return null;
        return schema.forceValue;
    }

    const isSchemaForArray = !!member && !!keySelector;
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const values = (asArray(obj ?? [])).map((element) => {
            const localMember = member(element, baseValue, context);
            return accumulateValuesImpl(element, localMember, baseValue, context, settings);
        });
        if (hasNoValues(values)) {
            if (isDefined(schema.defaultValue)) {
                if (schema.defaultValue === undefinedValue) return undefined;
                if (schema.defaultValue === nullValue) return null;
                return schema.defaultValue;
            }
            return [];
        }
        return values;
    }

    if (isSchemaForObject) {
        const localFields = fields(obj, baseValue, context);
        const values = Object.keys(localFields).reduce<Record<string, unknown>>(
            (acc, fieldName) => {
                const value = accumulateValuesImpl(
                    asRecord(obj)?.[fieldName],
                    localFields[fieldName],
                    baseValue,
                    context,
                    settings,
                );
                if (value !== undefined) return { ...acc, [fieldName]: value };
                return acc;
            },
            {},
        );
        if (hasNoKeys(values)) {
            if (isDefined(schema.defaultValue)) {
                if (schema.defaultValue === undefinedValue) return undefined;
                if (schema.defaultValue === nullValue) return null;
                return schema.defaultValue;
            }
            return nullable ? null : undefined;
        }
        return values;
    }

    // Literal
    const requiredCondition = schema.requiredValidation ?? genericRequiredCondition;
    if (!requiredCondition(obj, baseValue, context)) {
        return obj;
    }
    if (isDefined(schema.defaultValue)) {
        if (schema.defaultValue === undefinedValue) return undefined;
        if (schema.defaultValue === nullValue) return null;
        return schema.defaultValue;
    }
    return nullable ? null : undefined;
}

// ─── accumulateErrors implementation ─────────────────────────────────────────

function accumulateErrorsImpl(
    obj: unknown,
    schema: InternalSchema,
    baseValue: unknown,
    context: unknown,
): unknown {
    const {
        validation,
        fields,
        member,
        keySelector,
    } = schema;

    const isSchemaForArray = !!member && !!keySelector;
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const errors: InternalErrors = {};
        if (validation) {
            const err = validation(obj, baseValue, context);
            if (err) errors[nonFieldError] = err;
        }
        if (obj) {
            asArray(obj).forEach((element) => {
                const localMember = member(element, baseValue, context);
                const fieldError = accumulateErrorsImpl(element, localMember, baseValue, context);
                if (fieldError) {
                    errors[keySelector(element)] = fieldError;
                }
            });
        }
        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const errors: InternalErrors = {};
        if (validation) {
            const err = validation(obj, baseValue, context);
            if (err) errors[nonFieldError] = err;
        }
        const localFields = fields(obj, baseValue, context);
        Object.keys(localFields).forEach((fieldName) => {
            const fieldError = accumulateErrorsImpl(
                asRecord(obj)?.[fieldName],
                localFields[fieldName],
                baseValue,
                context,
            );
            if (fieldError) errors[fieldName] = fieldError;
        });
        return hasNoKeys(errors) ? undefined : errors;
    }

    // Literal
    if (schema.required) {
        if (schema.requiredValidation) {
            const error = schema.requiredValidation(obj, baseValue, context);
            if (error) return error;
        } else {
            const failed = genericRequiredCondition(obj);
            if (failed) return schema.messages?.required ?? failed;
        }
    }

    const constraintError = validateConstraints(obj, schema);
    if (constraintError) return constraintError;

    let error: string | undefined;
    schema.validations?.every((rule) => {
        const message = rule(obj, baseValue, context);
        if (message) error = message;
        return !message;
    });
    return error;
}

// ─── accumulateDifferentialErrors implementation ──────────────────────────────

function accumulateDifferentialErrorsImpl(
    oldObj: unknown,
    newObj: unknown,
    oldError: unknown,
    schema: InternalSchema | undefined,
    baseValue: unknown,
    context: unknown,
    depsChanged: boolean,
): unknown {
    if (!schema) return undefined;
    if (!depsChanged && oldObj === newObj) return oldError;

    const {
        validation,
        fields,
        member,
        keySelector,
    } = schema;

    const isSchemaForArray = !!member && !!keySelector;
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const errors: InternalErrors = {};
        if (validation) {
            const err = validation(newObj, baseValue, context);
            if (err) errors[nonFieldError] = err;
        }

        let {
            unmodified,
            modified,
        } = findDifferenceInList(
            asArray(oldObj ?? []),
            asArray(newObj ?? []),
            keySelector,
        );

        if (depsChanged) {
            modified = [
                ...unmodified.map((item) => ({ new: item, old: item })),
                ...modified,
            ];
            unmodified = [];
        }

        const oldErrorRecord = asRecord(oldError ?? {});

        unmodified.forEach((e) => {
            const index = keySelector(e);
            if (oldErrorRecord[index]) errors[index] = oldErrorRecord[index];
        });

        modified.forEach((e) => {
            const localMember = member(e.new, baseValue, context);
            const index = keySelector(e.new);
            const fieldError = accumulateDifferentialErrorsImpl(
                e.old,
                e.new,
                oldErrorRecord[index],
                localMember,
                baseValue,
                context,
                depsChanged,
            );
            if (fieldError) errors[index] = fieldError;
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const errors: InternalErrors = {};
        if (validation) {
            const err = validation(newObj, baseValue, context);
            if (err) errors[nonFieldError] = err;
        }

        const oldObjRecord = asRecord(oldObj ?? {});
        const newObjRecord = asRecord(newObj ?? {});
        const oldErrorRecord = asRecord(oldError ?? {});

        const hasFieldDepsChanged = (deps: (string | number | symbol)[] | undefined): boolean => (
            deps?.some((key) => oldObjRecord[key as string] !== newObjRecord[key as string])
            ?? false
        );

        const localFields = fields(newObj, baseValue, context);
        const dependenciesObj = localFields[fieldDependencies];

        Object.keys(localFields).forEach((fieldName) => {
            const depsChangedForField = (
                hasFieldDepsChanged(dependenciesObj?.[fieldName])
                || (depsChanged && isDefined(dependenciesObj?.[fieldName]))
            );

            const fieldError = accumulateDifferentialErrorsImpl(
                oldObjRecord[fieldName],
                newObjRecord[fieldName],
                oldErrorRecord[fieldName],
                localFields[fieldName],
                baseValue,
                context,
                depsChangedForField,
            );

            if (fieldError) errors[fieldName] = fieldError;
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    // Literal
    if (schema.required) {
        if (
            (depsChanged && oldObj === newObj && !!oldError)
            || (oldObj !== newObj)
        ) {
            if (schema.requiredValidation) {
                const error = schema.requiredValidation(newObj, baseValue, context);
                if (error) return error;
            } else {
                const failed = genericRequiredCondition(newObj);
                if (failed) return schema.messages?.required ?? failed;
            }
        }
    }

    const constraintError = validateConstraints(newObj, schema);
    if (constraintError) return constraintError;

    let error: string | undefined;
    schema.validations?.every((rule) => {
        const message = rule(newObj, baseValue, context);
        if (message) error = message;
        return !message;
    });
    return error;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function accumulateValues<Value, TopValue = Value, Context = undefined>(
    obj: Value,
    schema: Schema<Value, TopValue, Context>,
    baseValue?: TopValue,
    context?: Context,
    settings?: { nullable?: boolean },
): Value {
    return accumulateValuesImpl(
        obj,
        schema as InternalSchema,
        baseValue !== undefined ? baseValue : obj,
        context,
        settings ?? {},
    ) as Value;
}

export function accumulateErrors<Value, TopValue = Value, Context = undefined>(
    obj: Value,
    schema: Schema<Value, TopValue, Context>,
    baseValue?: TopValue,
    context?: Context,
): Error<Value> | undefined {
    return accumulateErrorsImpl(
        obj,
        schema as InternalSchema,
        baseValue !== undefined ? baseValue : obj,
        context,
    ) as Error<Value> | undefined;
}

export function accumulateDifferentialErrors<Value, TopValue = Value, Context = undefined>(
    oldObj: Value,
    newObj: Value,
    oldError: Error<Value> | undefined,
    schema: Schema<Value, TopValue, Context> | undefined,
    baseValue?: TopValue,
    context?: Context,
    depsChanged?: boolean,
): Error<Value> | undefined {
    return accumulateDifferentialErrorsImpl(
        oldObj,
        newObj,
        oldError,
        schema as InternalSchema | undefined,
        baseValue !== undefined ? baseValue : newObj,
        context,
        depsChanged ?? false,
    ) as Error<Value> | undefined;
}

// ─── analyzeErrors ────────────────────────────────────────────────────────────

export function analyzeErrors(
    errors: ArrayError<unknown> | ObjectError<unknown> | LeafError | null | undefined,
): boolean {
    if (isNotDefined(errors)) return false;
    if (typeof errors === 'string') return !!errors;
    if (errors[nonFieldError]) return true;

    const keys = Object.keys(errors);
    if (keys.length === 0) return false;
    return keys.some((key) => {
        const subErrors = (errors as Record<string, unknown>)[key];
        if (isObject(subErrors)) return analyzeErrors(subErrors as ObjectError<unknown>);
        return isDefined(subErrors);
    });
}

// ─── accumulateVisibility ─────────────────────────────────────────────────────

/**
 * Returns a map of field visibilities for all direct fields of an ObjectSchema.
 * A field is `false` (hidden) when its schema has `forceValue` set to
 * `nullValue` or `undefinedValue` — the standard pattern used with
 * `addCondition`.
 *
 * This lets you centralise show/hide logic in the schema rather than
 * duplicating it in JSX with `{value.someFlag && <Field />}`.
 *
 * @example
 * const visibility = accumulateVisibility(value, schema);
 * // { firstName: true, lastName: true, age: false, address: false }
 * // In JSX: {visibility.age && <NumberInput ... />}
 */
export function accumulateVisibility<Value extends object, TopValue = Value, Context = undefined>(
    obj: Value | undefined,
    schema: ObjectSchema<Value, TopValue, Context>,
    baseValue?: TopValue,
    context?: Context,
): VisibilityMap<Value> {
    const resolvedBase = (baseValue !== undefined ? baseValue : obj) as TopValue;
    const localFields = schema.fields(obj, resolvedBase, context as Context);

    return (Object.keys(localFields) as (keyof Value)[]).reduce(
        (acc, fieldName) => {
            const fieldSchema = localFields[fieldName] as { forceValue?: unknown } | undefined;
            const hidden = !!fieldSchema && isHiddenByForceValue(fieldSchema);
            return { ...acc, [fieldName]: !hidden };
        },
        {} as VisibilityMap<Value>,
    );
}

// ─── accumulateConstraints ────────────────────────────────────────────────────

/**
 * Extracts the built-in constraints (`maxLength`, `minLength`, `max`, `min`,
 * `integer`) from every direct field of an ObjectSchema and returns them as a
 * `ConstraintMap`.  Fields without any constraints are omitted.
 *
 * The schema's `fields` function is called with the current value, so
 * conditionally-modified constraints (set via `addCondition`) are reflected.
 *
 * @example
 * const constraints = accumulateConstraints(value, schema);
 * // { name: { maxLength: 100 }, age: { min: 0, max: 120 } }
 * // In JSX: <TextInput maxLength={constraints.name?.maxLength} />
 */
export function accumulateConstraints<Value extends object, TopValue = Value, Context = undefined>(
    obj: Value | undefined,
    schema: ObjectSchema<Value, TopValue, Context>,
    baseValue?: TopValue,
    context?: Context,
): ConstraintMap<Value> {
    const resolvedBase = (baseValue !== undefined ? baseValue : obj) as TopValue;
    const localFields = schema.fields(obj, resolvedBase, context as Context);

    return (Object.keys(localFields) as (keyof Value)[]).reduce(
        (acc, fieldName) => {
            const fieldSchema = localFields[fieldName] as (FieldConstraints & {
                fields?: unknown;
                member?: unknown;
                keySelector?: unknown;
            }) | undefined;
            if (!fieldSchema) return acc;

            // Built-in constraints are only enforced for literal fields (validateConstraints
            // runs in the literal branch of accumulateErrors). A constraint co-located with an
            // object (`fields`) or array (`member` + `keySelector`) schema is never validated,
            // so don't advertise it here — keep the constraint map in lock-step with validation.
            const isSchemaForObject = !!fieldSchema.fields;
            const isSchemaForArray = !!fieldSchema.member && !!fieldSchema.keySelector;
            if (isSchemaForObject || isSchemaForArray) return acc;

            const {
                maxLength,
                minLength,
                max,
                min,
                integer,
            } = fieldSchema;

            if (
                maxLength === undefined
                && minLength === undefined
                && max === undefined
                && min === undefined
                && integer === undefined
            ) {
                return acc;
            }

            const constraints: FieldConstraints = {};
            if (maxLength !== undefined) constraints.maxLength = maxLength;
            if (minLength !== undefined) constraints.minLength = minLength;
            if (max !== undefined) constraints.max = max;
            if (min !== undefined) constraints.min = min;
            if (integer !== undefined) constraints.integer = integer;

            return { ...acc, [fieldName]: constraints };
        },
        {} as ConstraintMap<Value>,
    );
}

// ─── addCondition ─────────────────────────────────────────────────────────────

function addConditionImpl(
    schema: Record<string | symbol, unknown>,
    value: Record<string, unknown> | null | undefined,
    keys: readonly string[],
    values: readonly string[],
    updater: (val: Record<string, unknown> | null | undefined) => Record<string, unknown>,
): Record<string | symbol, unknown> {
    const pickedValues = value != null
        ? pick(value, keys as (keyof typeof value)[])
        : value;
    const prevFieldDependencies = (
        schema[fieldDependencies] as Record<string, (string | symbol)[]> | undefined
    ) ?? {};
    return {
        ...schema,
        ...pick(
            updater(pickedValues),
            values as (keyof ReturnType<typeof updater>)[],
        ),
        [fieldDependencies]: {
            ...prevFieldDependencies,
            ...listToMap(
                [...values],
                (key) => key,
                (key) => unique([
                    ...(prevFieldDependencies[key] ?? []),
                    ...keys,
                ]),
            ),
        },
    };
}

export const addCondition = addConditionImpl as unknown as <
    Value,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SchemaType extends { [K in keyof NonNullable<Value>]: Schema<NonNullable<Value>[K], any, any> },
    const DepKey extends keyof NonNullable<Value>,
    const ValKey extends keyof NonNullable<Value> & keyof SchemaType,
>(
    schema: SchemaType,
    value: Value,
    keys: readonly DepKey[],
    values: readonly ValKey[],
    updater: (
        val: Value extends null | undefined
            ? null | undefined
            : Pick<NonNullable<Value>, DepKey>,
    ) => Pick<SchemaType, ValKey>,
) => SchemaType;
