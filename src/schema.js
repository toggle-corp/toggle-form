import {
    isObject,
    isList,
    isFalsy,
    isTruthy,
    findDifferenceInList,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { idCondition, arrayCondition, nullCondition } from './validation';

const emptyArray = [];

const hasNoKeys = (obj) => (
    isFalsy(obj) || Object.keys(obj).length === 0
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
        if (schema.includes(nullCondition)) {
            if (schema.includes(arrayCondition)) {
                return [];
            }
            return null;
        }
        if (isNotDefined(obj)) {
            // id cannot be unset so setting null would be bad
            if (schema.includes(idCondition)) {
                return undefined;
            }
            if (schema.includes(arrayCondition)) {
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

export const accumulateErrors = (obj, schema, value = obj) => {
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
            const message = rule(obj, value);
            if (message) {
                if (schema.includes(arrayCondition)) {
                    error = { $internal: message };
                } else {
                    error = message;
                }
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(obj);
        if (validationErrors) {
            errors.$internal = validationErrors;
        }
    }

    if (isSchemaForArray) {
        if (obj) {
            obj.forEach((element) => {
                const localMember = member(element);
                const fieldError = accumulateErrors(element, localMember);
                if (fieldError) {
                    const index = keySelector(element);
                    if (!errors.members) {
                        errors.members = {};
                    }
                    errors.members[index] = fieldError;
                }
            });
        }
        return hasNoKeys(errors.members) && !errors.$internal ? undefined : errors;
    }

    if (isSchemaForObject) {
        const localFields = fields(obj);
        Object.keys(localFields).forEach((fieldName) => {
            const fieldError = accumulateErrors(obj?.[fieldName], localFields[fieldName], obj);
            if (fieldError) {
                if (!errors.fields) {
                    errors.fields = {};
                }
                errors.fields[fieldName] = fieldError;
            }
        });
        return hasNoKeys(errors.fields) && !errors.$internal ? undefined : errors;
    }

    console.error('Accumulate Error: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateDifferentialErrors = (
    oldObj,
    newObj,
    oldError,
    schema,
    value = newObj,
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
            const message = rule(newObj, value);
            if (message) {
                if (schema.includes(arrayCondition)) {
                    error = { $internal: message };
                } else {
                    error = message;
                }
            }
            return !message;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(newObj);
        if (validationErrors) {
            errors.$internal = validationErrors;
        }
    }

    if (isSchemaForArray) {
        const {
            unmodified,
            modified,
        } = findDifferenceInList(oldObj || [], newObj || [], keySelector);

        unmodified.forEach((e) => {
            const index = keySelector(e);
            if (oldError?.members?.[index]) {
                if (!errors.members) {
                    errors.members = {};
                }
                errors.members[index] = oldError?.members?.[index];
            }
        });

        modified.forEach((e) => {
            const localMember = member(e.new);
            const index = keySelector(e.new);
            const fieldError = accumulateDifferentialErrors(
                e.old,
                e.new,
                oldError?.members?.[index],
                localMember,
                value,
            );

            if (fieldError) {
                if (!errors.members) {
                    errors.members = {};
                }
                errors.members[index] = fieldError;
            }
        });

        return hasNoKeys(errors.members) && !errors.$internal ? undefined : errors;
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
                if (oldError?.fields?.[fieldName]) {
                    if (!errors.fields) {
                        errors.fields = {};
                    }
                    errors.fields[fieldName] = oldError?.fields?.[fieldName];
                }
                return;
            }

            const fieldError = accumulateDifferentialErrors(
                oldObj?.[fieldName],
                newObj?.[fieldName],
                oldError?.fields?.[fieldName],
                localFields[fieldName],
                newObj,
                true,
            );

            if (fieldError) {
                if (!errors.fields) {
                    errors.fields = {};
                }
                errors.fields[fieldName] = fieldError;
            }
        });

        return hasNoKeys(errors.fields) && !errors.$internal ? undefined : errors;
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
    if (errors.$internal) {
        return true;
    }
    if (errors.fields) {
        // handles empty object {}
        const keys = Object.keys(errors.fields);
        if (keys.length === 0) {
            return false;
        }
        return keys.some((key) => {
            const subErrors = errors.fields[key];
            // handles object
            if (isObject(subErrors)) {
                return analyzeErrors(subErrors);
            }
            // handles string or array of strings
            return isTruthy(subErrors);
        });
    }
    if (errors.members) {
        // handles empty object {}
        const keys = Object.keys(errors.members);
        if (keys.length === 0) {
            return false;
        }
        return keys.some((key) => {
            const subErrors = errors.members[key];
            // handles object
            if (isObject(subErrors)) {
                return analyzeErrors(subErrors);
            }
            // handles string or array of strings
            return isTruthy(subErrors);
        });
    }
    return false;
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
