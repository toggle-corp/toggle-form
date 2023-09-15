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

export function accumulateValues(
    obj,
    schema,
    baseValue = obj,
    context = undefined,
    settings = {},
) {
    const {
        // FIXME: add a note on what nullable does
        nullable = false,
    } = settings;

    // NOTE: if schema is array, the object is the node element
    const {
        fields,

        member,
        keySelector,
    } = schema;

    if (isDefined(schema.forceValue)) {
        if (schema.forceValue === undefinedValue) {
            return undefined;
        }
        if (schema.forceValue === nullValue) {
            return null;
        }
        return schema.forceValue;
    }

    const isSchemaForArray = (!!member && !!keySelector);
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const values = (obj ?? []).map((element) => {
            const localMember = member(element, baseValue, context);
            const value = accumulateValues(
                element,
                localMember,
                baseValue,
                context,
                settings,
            );
            return value;
        });
        if (hasNoValues(values)) {
            if (isDefined(schema.defaultValue)) {
                if (schema.defaultValue === undefinedValue) {
                    return undefined;
                }
                if (schema.defaultValue === nullValue) {
                    return null;
                }
                return schema.defaultValue;
            }
            // FIXME: should we instead use (return nullable ? null : undefined)?
            return [];
        }
        return values;
    }
    if (isSchemaForObject) {
        const localFields = fields(obj, baseValue, context);
        const values = Object.keys(localFields).reduce(
            (acc, fieldName) => {
                const value = accumulateValues(
                    obj?.[fieldName],
                    localFields[fieldName],
                    baseValue,
                    context,
                    settings,
                );
                if (value !== undefined) {
                    return {
                        ...acc,
                        [fieldName]: value,
                    };
                }
                return acc;
            },
            {},
        );
        if (hasNoKeys(values)) {
            if (isDefined(schema.defaultValue)) {
                if (schema.defaultValue === undefinedValue) {
                    return undefined;
                }
                if (schema.defaultValue === nullValue) {
                    return null;
                }
                return schema.defaultValue;
            }
            return nullable ? null : undefined;
        }
        return values;
    }

    const requiredCondition = schema.requiredValidation ?? genericRequiredCondition;

    if (!requiredCondition(obj, baseValue, context)) {
        return obj;
    }
    if (isDefined(schema.defaultValue)) {
        if (schema.defaultValue === undefinedValue) {
            return undefined;
        }
        if (schema.defaultValue === nullValue) {
            return null;
        }
        return schema.defaultValue;
    }
    return nullable ? null : undefined;
}

export function accumulateErrors(
    obj,
    schema,
    baseValue = obj,
    context = undefined,
) {
    const {
        validation,

        fields,

        member,
        keySelector,
    } = schema;
    const isSchemaForArray = (!!member && !!keySelector);
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const errors = {};
        if (validation) {
            const validationErrors = validation(obj, baseValue, context);
            if (validationErrors) {
                errors[nonFieldError] = validationErrors;
            }
        }

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
        const errors = {};
        if (validation) {
            const validationErrors = validation(obj, baseValue, context);
            if (validationErrors) {
                errors[nonFieldError] = validationErrors;
            }
        }

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

    if (schema.required) {
        const requiredCondition = schema.requiredValidation ?? genericRequiredCondition;
        const error = requiredCondition(obj, baseValue, context);
        if (error) {
            return error;
        }
    }

    let error;
    schema.validations?.every((rule) => {
        const message = rule(obj, baseValue, context);
        if (message) {
            error = message;
        }
        return !message;
    });
    return error;
}

// FIXME: only copy oldErrors when a change is detected
export function accumulateDifferentialErrors(
    oldObj,
    newObj,
    oldError,
    schema,
    baseValue = newObj,
    context = undefined,
    depsChanged = false,
) {
    // NOTE: schema can be undefined if the schema changed
    if (!schema) {
        return undefined;
    }
    if (!depsChanged && oldObj === newObj) {
        return oldError;
    }
    // NOTE: if schema is array, the object is the node element
    const {
        validation,

        fields,

        member,
        keySelector,
    } = schema;
    const isSchemaForArray = !!member && !!keySelector;
    const isSchemaForObject = !!fields;

    if (isSchemaForArray) {
        const errors = {};
        // FIXME: make this more performant? deps?
        if (validation) {
            const validationErrors = validation(newObj, baseValue, context);
            if (validationErrors) {
                errors[nonFieldError] = validationErrors;
            }
        }

        let {
            unmodified,
            modified,
        } = findDifferenceInList(oldObj ?? [], newObj ?? [], keySelector);

        if (depsChanged) {
            modified = [
                ...unmodified.map((item) => ({ new: item, old: item })),
                ...modified,
            ];
            unmodified = [];
        }

        unmodified.forEach((e) => {
            const index = keySelector(e);
            if (oldError?.[index]) {
                errors[index] = oldError?.[index];
            }
        });

        modified.forEach((e) => {
            const localMember = member(e.new);
            const index = keySelector(e.new);

            // console.warn(index, depsChanged);

            const fieldError = accumulateDifferentialErrors(
                e.old,
                e.new,
                oldError?.[index],
                localMember,
                baseValue,
                context,
                depsChanged,
            );

            if (fieldError) {
                errors[index] = fieldError;
            }
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    if (isSchemaForObject) {
        const errors = {};
        // FIXME: make this more performant? deps?
        if (validation) {
            const validationErrors = validation(newObj, baseValue, context);
            if (validationErrors) {
                errors[nonFieldError] = validationErrors;
            }
        }

        const hasFieldDepsChanged = (deps) => deps?.some(
            (key) => oldObj?.[key] !== newObj?.[key],
        ) ?? false;

        const localFields = fields(newObj, baseValue, context);
        const dependenciesObj = localFields[fieldDependencies];

        Object.keys(localFields).forEach((fieldName) => {
            const depsChangedForField = (
                hasFieldDepsChanged(dependenciesObj?.[fieldName])
                // NOTE: if the dependency changed the parent then validation
                // should be retriggered for all the children that are conditional
                || (depsChanged && isDefined(dependenciesObj?.[fieldName]))
            );

            // console.warn(fieldName, depsChangedForField, dependenciesObj?.[fieldName]);

            const fieldError = accumulateDifferentialErrors(
                oldObj?.[fieldName],
                newObj?.[fieldName],
                oldError?.[fieldName],
                localFields[fieldName],
                baseValue,
                context,
                depsChangedForField,
            );

            if (fieldError) {
                errors[fieldName] = fieldError;
            }
        });

        return hasNoKeys(errors) ? undefined : errors;
    }

    if (schema.required) {
        if (
            (depsChanged && oldObj === newObj && !!oldError)
            || (oldObj !== newObj)
        ) {
            const requiredCondition = schema.requiredValidation ?? genericRequiredCondition;
            const error = requiredCondition(newObj, baseValue, context);
            if (error) {
                return error;
            }
        }
    }

    let error;
    schema.validations?.every((rule) => {
        const message = rule(newObj, baseValue, context);
        if (message) {
            error = message;
        }
        return !message;
    });
    return error;
}

export function analyzeErrors(errors) {
    // handles undefined, null
    if (isNotDefined(errors)) {
        return false;
    }
    if (typeof errors === 'string') {
        return !!errors;
    }
    if (errors[nonFieldError]) {
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
        return isDefined(subErrors);
    });
}

// FIXME: move this to a helper
// FIXME: check conditions for change in context and baseValue
export function addCondition(
    schema,
    value,
    dependentKeys,
    valueKeys,
    updater,
) {
    const pickedValues = pick(value, dependentKeys);
    const prevFieldDependencies = schema[fieldDependencies] ?? {};
    return {
        ...schema,
        ...pick(updater(pickedValues), valueKeys),
        [fieldDependencies]: {
            ...prevFieldDependencies,

            ...listToMap(
                valueKeys,
                (key) => key,
                (key) => unique([
                    ...(prevFieldDependencies[key] ?? []),
                    ...dependentKeys,
                ]),
            ),
        },
    };
}
