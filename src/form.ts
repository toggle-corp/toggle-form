import {
    useReducer,
    useCallback,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    accumulateDifferentialErrors,
    accumulateErrors,
    analyzeErrors,
    accumulateValues,
} from './schema';

import type { Schema, Error } from './schema';
import type {
    SetValueArg,
    EntriesAsKeyValue,
    EntriesAsList,
} from './types';
import { isCallable } from './utils';

type ValidateFunc<T> = () => (
    { errored: true, error: Error<T>, value: undefined }
    | { errored: false, value: T, error: undefined }
)

// eslint-disable-next-line @typescript-eslint/ban-types
function useForm<T extends object>(
    schema: Schema<T>,
    initialFormValue: T,
    initialPristine = true,
    initialError?: Error<T>,
): {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
    validate: ValidateFunc<T>,

    setPristine: (pristine: boolean) => void,
    setError: (errors: Error<T> | undefined) => void,
    setValue: (value: SetValueArg<T>, doNotReset?: boolean) => void,
    setFieldValue: (...entries: EntriesAsList<T>) => void,
} {
    interface ErrorAction {
        type: 'SET_ERROR';
        error: Error<T> | undefined;
    }
    interface ValueAction {
        type: 'SET_VALUE';
        value: T | ((oldVal: T) => T);
        doNotReset: boolean | undefined;
    }
    interface PristineAction {
        type: 'SET_PRISTINE';
        value: boolean;
    }
    type ValueFieldAction = EntriesAsKeyValue<T> & { type: 'SET_VALUE_FIELD' };

    const formReducer = useCallback(
        (
            prevState: { value: T, error: Error<T> | undefined, pristine: boolean },
            action: ValueFieldAction | ErrorAction | ValueAction | PristineAction,
        ) => {
            if (action.type === 'SET_PRISTINE') {
                const { value } = action;
                return {
                    ...prevState,
                    pristine: value,
                };
            }
            if (action.type === 'SET_ERROR') {
                const { error } = action;
                return {
                    ...prevState,
                    error,
                };
            }
            if (action.type === 'SET_VALUE') {
                const {
                    value: valueFromAction,
                    doNotReset,
                } = action;

                const newVal = isCallable(valueFromAction)
                    ? valueFromAction(prevState.value)
                    : valueFromAction;

                if (doNotReset) {
                    return {
                        ...prevState,
                        value: newVal,
                    };
                }

                return {
                    value: newVal,
                    error: undefined,
                    pristine: true,
                };
            }
            if (action.type === 'SET_VALUE_FIELD') {
                const {
                    key,
                    value: valueFromAction,
                } = action;
                const oldValue = prevState.value;
                const oldError = prevState.error;

                const newVal = isCallable(valueFromAction)
                    ? valueFromAction(oldValue[key])
                    : valueFromAction;

                // NOTE: just don't set anything if the value is not really changed
                if (oldValue[key] === newVal) {
                    return prevState;
                }

                const newValue = {
                    ...oldValue,
                    [key]: newVal,
                };

                const newError = accumulateDifferentialErrors(
                    oldValue,
                    newValue,
                    oldError,
                    schema,
                );

                return {
                    value: newValue,
                    error: newError,
                    pristine: false,
                };
            }
            console.error('Action is not supported');
            return prevState;
        },
        [schema],
    );

    const [state, dispatch] = useReducer(
        formReducer,
        { value: initialFormValue, error: initialError, pristine: initialPristine },
    );

    const setPristine = useCallback(
        (pristineValue: boolean) => {
            const action: PristineAction = {
                type: 'SET_PRISTINE',
                value: pristineValue,
            };
            dispatch(action);
        },
        [],
    );

    const setError = useCallback(
        (errors: Error<T> | undefined) => {
            const action: ErrorAction = {
                type: 'SET_ERROR',
                error: errors,
            };
            dispatch(action);
        },
        [],
    );

    const setValue = useCallback(
        (value: SetValueArg<T>, doNotReset) => {
            const action: ValueAction = {
                type: 'SET_VALUE',
                value,
                doNotReset,
            };
            dispatch(action);
        },
        [],
    );

    const setFieldValue = useCallback(
        (...entries: EntriesAsList<T>) => {
            const [value, key] = entries;
            const action: ValueFieldAction = {
                type: 'SET_VALUE_FIELD',
                key,
                value,
            };
            dispatch(action);
        },
        [],
    );

    const validate: ValidateFunc<T> = useCallback(
        () => {
            const stateErrors = accumulateErrors(state.value, schema);
            const stateErrored = analyzeErrors(stateErrors);
            if (stateErrored) {
                return { errored: true, error: stateErrors as Error<T>, value: undefined };
            }
            const validatedValues = accumulateValues(
                state.value,
                schema,
                // NOTE: server needs `null` to identify that the value is not defined
                { nullable: true },
            );
            return { errored: false, value: validatedValues, error: undefined };
        },
        [schema, state],
    );

    return {
        value: state.value,
        error: state.error,
        pristine: state.pristine,

        setError,
        setValue,
        setFieldValue,
        setPristine,
        validate,
    };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormObject<K extends string | number, T extends object | undefined>(
    name: K,
    onChange: (value: SetValueArg<T>, name: K) => void,
    // TODO: maybe make defaultValue callable
    defaultValue: NonNullable<T>,
) {
    const setFieldValue = useCallback(
        (...entries: EntriesAsList<NonNullable<T>>) => {
            // NOTE: may need to cast callableValue here
            const [callableValue, key] = entries;
            onChange(
                (oldValue: T): T => {
                    const baseValue = oldValue ?? defaultValue;
                    return {
                        ...baseValue,
                        [key]: isCallable(callableValue)
                            ? callableValue(baseValue[key])
                            : callableValue,
                    };
                },
                name,
            );
        },
        [name, defaultValue, onChange],
    );

    return setFieldValue;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormArray<K extends string, T extends object>(
    name: K,
    onChange: (
        newValue: SetValueArg<T[] | undefined>,
        inputName: K,
    ) => void,
) {
    const setValue = useCallback(
        (val: SetValueArg<T>, index: number) => {
            onChange(
                (oldValue: T[] | undefined): T[] | undefined => {
                    if (!oldValue) {
                        return undefined;
                    }
                    const newVal = [...oldValue];
                    newVal[index] = isCallable(val)
                        ? val(oldValue[index])
                        : val;
                    return newVal;
                },
                name,
            );
        },
        [name, onChange],
    );

    const removeValue = useCallback(
        (index: number) => {
            onChange(
                (oldValue: T[] | undefined): T[] | undefined => {
                    if (!oldValue) {
                        return undefined;
                    }
                    const newVal = [...oldValue];
                    newVal.splice(index, 1);
                    return newVal;
                },
                name,
            );
        },
        [name, onChange],
    );

    return { setValue, removeValue };
}

// FIXME: move this to helper
export function createSubmitHandler<T>(
    validator: () => ({ errored: boolean, error: Error<T> | undefined, value: T | undefined }),
    setError: (errors: Error<T> | undefined) => void,
    callback: (value: T) => void,
) {
    return (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const { errored, error, value } = validator();
        setError(error);
        if (!errored && isDefined(value)) {
            callback(value);
        }
    };
}

export default useForm;
