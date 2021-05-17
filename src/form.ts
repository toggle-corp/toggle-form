import {
    useReducer,
    useCallback,
    useEffect,
    useRef,
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
    StateArg,
    EntriesAsKeyValue,
    EntriesAsList,
} from './types';
import { isCallable } from './utils';

type ValidateReturn<T> = () => (
    { errored: true, error: Error<T>, value: undefined }
    | { errored: false, value: T, error: undefined }
)

// eslint-disable-next-line @typescript-eslint/ban-types
function useForm<T extends object>(
    initialFormValue: T,
    schema: Schema<T>,
): {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
    validate: ValidateReturn<T>,
    onPristineSet: (pristine: boolean) => void,
    onErrorSet: (errors: Error<T> | undefined) => void,
    onValueSet: (value: StateArg<T>) => void,
    onValueChange: (...entries: EntriesAsList<T>) => void,
} {
    type ErrorAction = { type: 'SET_ERROR', error: Error<T> | undefined };
    type ValueAction = { type: 'SET_VALUE', value: T | ((oldVal: T) => T) };
    type PristineAction = { type: 'SET_PRISTINE', value: boolean };
    type ValueFieldAction = EntriesAsKeyValue<T> & { type: 'SET_VALUE_FIELD' };

    const formReducer = useCallback((
        prevState: { value: T, error: Error<T> | undefined, pristine: boolean },
        action: ValueFieldAction | ErrorAction | ValueAction | PristineAction,
    ) => {
        if (action.type === 'SET_VALUE') {
            const { value: valueFromAction } = action;

            const newVal = isCallable(valueFromAction)
                ? valueFromAction(prevState.value)
                : valueFromAction;

            return {
                value: newVal,
                error: undefined,
                pristine: true,
            };
        }
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
    }, [schema]);

    const [state, dispatch] = useReducer(
        formReducer,
        { value: initialFormValue, error: undefined, pristine: true },
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
        (value: StateArg<T>) => {
            const action: ValueAction = {
                type: 'SET_VALUE',
                value,
            };
            dispatch(action);
        },
        [],
    );

    const setValueField = useCallback(
        (...entries: EntriesAsList<T>) => {
            const action: ValueFieldAction = {
                type: 'SET_VALUE_FIELD',
                key: entries[1],
                value: entries[0],
            };
            dispatch(action);
        },
        [],
    );

    const validate = useCallback(
        (): ReturnType<ValidateReturn<T>> => {
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
        onErrorSet: setError,
        onValueSet: setValue,
        onValueChange: setValueField,
        onPristineSet: setPristine,
        validate,
    };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormObject<K extends string | number, T extends object | undefined>(
    name: K,
    onChange: (value: StateArg<T>, name: K) => void,
    defaultValue: NonNullable<T>,
) {
    const onValueChange = useCallback(
        (...entries: EntriesAsList<NonNullable<T>>) => {
            // NOTE: may need to cast callableValue here
            const callableValue = entries[0];
            const key = entries[1];
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

    return onValueChange;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormArray<K extends string, T extends object>(
    name: K,
    onChange: (
        newValue: StateArg<T[] | undefined>,
        inputName: K,
    ) => void,
) {
    const onValueChange = useCallback(
        (val: StateArg<T>, index: number) => {
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

    const onValueRemove = useCallback(
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

    return { onValueChange, onValueRemove };
}

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
