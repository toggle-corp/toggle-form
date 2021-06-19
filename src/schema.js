import {
    isObject,
    isList,
    isFalsy,
    isTruthy,
    findDifferenceInList,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { internal } from './types';
import {
    forceNullType,
    forceEmptyArrayType,

    defaultUndefinedType,
    defaultEmptyArrayType,
} from './validation';

const emptyArray = [];

const hasNoKeys = (obj) => (
    isFalsy(obj) || (Object.keys(obj).length + Object.getOwnPropertySymbols(obj).length) === 0
);

const hasNoValues = (array) => (
    isFalsy(array) || array.length <= 0 || array.every((e) => isFalsy(e))
);

export const accumulateValues = (obj, schema, settings = {}) => {
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
                const localMember = member(element);
                const value = accumulateValues(element, localMember, settings);
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
        const localFields = fields(obj);
        Object.keys(localFields).forEach((fieldName) => {
            const value = accumulateValues(obj?.[fieldName], localFields[fieldName], settings);
            if (value !== undefined) {
                values[fieldName] = value;
            }
        });
        // FIXME: don't copy values if there is nothing to be cleared
        if (hasNoKeys(values)) {
            return nullable ? null : undefined;
        }
        return values;
    }

    console.error('Accumulate Value: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateErrors = (obj, schema, baseValue = obj) => {
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
            const message = rule(obj, baseValue);
            if (message) {
                error = message;
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(obj);
        if (validationErrors) {
            errors[internal] = validationErrors;
        }
    }

    if (isSchemaForArray) {
        if (obj) {
            obj.forEach((element) => {
                const localMember = member(element);
                const fieldError = accumulateErrors(element, localMember, baseValue);
                if (fieldError) {
                    const index = keySelector(element);
                    errors[index] = fieldError;
                }
            });
        }
        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const localFields = fields(obj);
        Object.keys(localFields).forEach((fieldName) => {
            const fieldError = accumulateErrors(
                obj?.[fieldName],
                localFields[fieldName],
                baseValue,
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
            const message = rule(newObj, baseValue);
            if (message) {
                error = message;
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(newObj);
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

        const localFields = fields(newObj);
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

export function removeNull(data) {
    if (data === null || data === undefined) {
        return undefined;
    }
    if (isList(data)) {
        return data.map(removeNull).filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        Object.keys(data).forEach((k) => {
            const key = k;
            const val = data[key];
            const newEntry = removeNull(val);
            if (isDefined(newEntry)) {
                newData = {
                    ...newData,
                    [key]: newEntry,
                };
            }
        });
        return newData;
    }
    return data;
}
