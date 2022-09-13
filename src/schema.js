import {
    isObject,
    isList,
    isFalsy,
    isTruthy,
    findDifferenceInList,
    isNotDefined,
} from '@togglecorp/fujs';
import { internal } from './types';
import {
    forceNullType,
    forceUndefinedType,
    forceEmptyArrayType,

    defaultUndefinedType,
    defaultEmptyArrayType,
} from './validation';
import {
    hasNoKeys,
    hasNoValues,
} from './utils';

const emptyArray = [];

export const accumulateValues = (
    obj,
    schema,
    settings = {},
    baseValue = obj,
    context,
) => {
    const {
        nullable = false,
        /*
        noFalsyValues = false,
        falsyValue = undefined,
        */
    } = settings;

    // NOTE: if schema is array, the object is the node element
    const {
        member,
        fields,
        keySelector,
    } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = (!!member && !!keySelector);
    const isSchemaForObject = !!fields;

    if (isSchemaForLeaf) {
        if (schema.includes(forceNullType)) {
            return null;
        }
        if (schema.includes(forceUndefinedType)) {
            return undefined;
        }
        if (schema.includes(forceEmptyArrayType)) {
            return [];
        }
        if (isNotDefined(obj)) {
            // id cannot be unset so setting null would be bad
            if (schema.includes(defaultUndefinedType)) {
                return undefined;
            }
            if (schema.includes(defaultEmptyArrayType)) {
                return [];
            }
            return nullable ? null : undefined;
        }
        return obj;
    }
    if (isSchemaForArray) {
        const values = [];
        if (obj) {
            obj.forEach((element) => {
                const localMember = member(element, baseValue, context);
                const value = accumulateValues(
                    element,
                    localMember,
                    settings,
                    baseValue,
                    context,
                );
                values.push(value);
            });
        }
        if (hasNoValues(values)) {
            // return nullable ? null : emptyArray;
            // NOTE: array will always be emptyArray
            return emptyArray;
        }
        return values;
    }
    if (isSchemaForObject) {
        const values = {};
        const localFields = fields(obj, baseValue, context);
        Object.keys(localFields).forEach((fieldName) => {
            const value = accumulateValues(
                obj?.[fieldName],
                localFields[fieldName],
                settings,
                baseValue,
                context,
            );
            if (value !== undefined) {
                values[fieldName] = value;
            }
        });
        if (hasNoKeys(values)) {
            return nullable ? null : undefined;
        }
        return values;
    }

    console.error('Accumulate Value: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateErrors = (
    obj,
    schema,
    baseValue = obj,
    context = undefined,
) => {
    const {
        member,
        fields,
        validation,
        keySelector,
    } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = (!!member && !!keySelector);
    const isSchemaForObject = !!fields;

    if (isSchemaForLeaf) {
        let error;
        schema.every((rule) => {
            const message = rule(obj, baseValue, context);
            if (message) {
                error = message;
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(obj, baseValue, context);
        if (validationErrors) {
            errors[internal] = validationErrors;
        }
    }

    if (isSchemaForArray) {
        if (obj) {
            obj.forEach((element) => {
                const localMember = member(element, baseValue, context);
                const fieldError = accumulateErrors(element, localMember, baseValue, context);
                if (fieldError) {
                    const index = keySelector(element);
                    errors[index] = fieldError;
                }
            });
        }
        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const localFields = fields(obj, baseValue, context);
        Object.keys(localFields).forEach((fieldName) => {
            const fieldError = accumulateErrors(
                obj?.[fieldName],
                localFields[fieldName],
                baseValue,
                context,
            );
            if (fieldError) {
                errors[fieldName] = fieldError;
            }
        });
        return hasNoKeys(errors) ? undefined : errors;
    }

    console.error('Accumulate Error: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateDifferentialErrors = (
    oldObj,
    newObj,
    oldError,
    schema,
    baseValue = newObj,
    // NOTE:
    // the function checks if oldObj and newObj are different
    // so, forced is used when the dependencies have changed
    // and the new error is calculated
    forced = false,
    context = undefined,
) => {
    if (!forced && oldObj === newObj) {
        return oldError;
    }
    // NOTE: if schema is array, the object is the node element
    const {
        member,
        fields,
        validation,
        keySelector,
        fieldDependencies,
    } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = !!member && !!keySelector;
    const isSchemaForObject = !!fields;

    if (isSchemaForLeaf) {
        let error;
        schema.every((rule) => {
            const message = rule(newObj, baseValue, context);
            if (message) {
                error = message;
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(newObj, baseValue, context);
        if (validationErrors) {
            errors[internal] = validationErrors;
        }
    }

    if (isSchemaForArray) {
        const {
            unmodified,
            modified,
        } = findDifferenceInList(oldObj || [], newObj || [], keySelector);

        unmodified.forEach((e) => {
            const index = keySelector(e);
            if (oldError?.[index]) {
                errors[index] = oldError?.[index];
            }
        });

        modified.forEach((e) => {
            const localMember = member(e.new);
            const index = keySelector(e.new);
            const fieldError = accumulateDifferentialErrors(
                e.old,
                e.new,
                oldError?.[index],
                localMember,
                baseValue,
                false,
                context,
            );

            if (fieldError) {
                errors[index] = fieldError;
            }
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const dependencies = fieldDependencies ? fieldDependencies() : undefined;
        const hasDepsChanged = (deps) => deps?.some(
            (key) => oldObj?.[key] !== newObj?.[key],
        ) ?? false;

        const localFields = fields(newObj, baseValue, context);
        Object.keys(localFields).forEach((fieldName) => {
            const depsChanged = hasDepsChanged(dependencies?.[fieldName]);

            if (oldObj?.[fieldName] === newObj?.[fieldName] && !depsChanged) {
                if (oldError?.[fieldName]) {
                    errors[fieldName] = oldError?.[fieldName];
                }
                return;
            }

            const fieldError = accumulateDifferentialErrors(
                oldObj?.[fieldName],
                newObj?.[fieldName],
                oldError?.[fieldName],
                localFields[fieldName],
                baseValue,
                true,
                context,
            );

            if (fieldError) {
                errors[fieldName] = fieldError;
            }
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    console.error('Accumulate Differential Error: Schema is invalid for ', schema);
    return undefined;
};

export const analyzeErrors = (errors) => {
    // handles undefined, null
    if (isFalsy(errors)) {
        return false;
    }
    if (typeof errors === 'string') {
        return !!errors;
    }
    if (errors[internal]) {
        return true;
    }

    // handles empty object {}
    const keys = Object.keys(errors);
    if (keys.length === 0) {
        return false;
    }
    return keys.some((key) => {
        const subErrors = errors[key];
        // handles object
        if (isObject(subErrors)) {
            return analyzeErrors(subErrors);
        }
        // handles string or array of strings
        return isTruthy(subErrors);
    });
};
