import {
    useReducer,
    useCallback,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    accumulateDifferentialErrors,
    accumulateErrors,
    analyzeErrors,
    accumulateValues,
} from './schema';

import type { Schema, Error } from './schema';
import type {
    SetValueArg,
    SetErrorArg,
    SetBaseValueArg,
    EntriesAsKeyValue,
    EntriesAsList,
} from './types';
import { isCallable } from './utils';

interface CreateRestorePointAction {
    type: 'CREATE_RESTORE_POINT';
}
interface RestoreRestorePointAction {
    type: 'RESTORE_RESTORE_POINT';
    retain: boolean,
}
interface ClearRestorePointAction {
    type: 'CLEAR_RESTORE_POINT';
}
interface ErrorAction<T> {
    type: 'SET_ERROR';
    error: SetErrorArg<Error<T>> | undefined;
}
interface ValueAction<T> {
    type: 'SET_VALUE';
    value: SetBaseValueArg<T>;
    partialUpdate: boolean | undefined;
}
interface PristineAction {
    type: 'SET_PRISTINE';
    value: boolean;
}
type ValueFieldAction<T> = EntriesAsKeyValue<T> & { type: 'SET_VALUE_FIELD' };

type Actions<T> = ValueFieldAction<T>
    | ErrorAction<T>
    | ValueAction<T>
    | PristineAction
    | CreateRestorePointAction
    | RestoreRestorePointAction
    | ClearRestorePointAction;

export type ValidateFunc<T> = (accumulateOnError?: boolean) => (
    { errored: true, error: Error<T>, value: unknown }
    | { errored: false, value: T, error: undefined }
)

type State<T> = {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
} & ({
    hasRestorePoint: true,
    restorePointValue: T,
    restorePointError: Error<T> | undefined,
    restorePointPristine: boolean,
} | {
    hasRestorePoint: false,
});

function useForm<T>(
    schema: Schema<T, T, undefined>,
    initialState: {
        value: T,
        error?: Error<T>,
        pristine?: boolean,
    },
    context?: never,
): {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
    validate: ValidateFunc<T>,

    setPristine: (pristine: boolean) => void,
    setError: (errors: SetErrorArg<Error<T>> | undefined) => void,
    setValue: (value: SetBaseValueArg<T>, partialUpdate?: boolean) => void,
    setFieldValue: (...entries: EntriesAsList<T>) => void,

    hasRestorePoint: boolean,
    restorePointValue: T,
    restorePointError: Error<T> | undefined,
    restorePointPristine: boolean,

    createRestorePoint: () => void;
    restore: () => void;
    clearRestorePoint: () => void;
};
function useForm<T, C>(
    schema: Schema<T, T, C>,
    initialState: {
        value: T,
        error?: Error<T>,
        pristine?: boolean,
    },
    context: C,
): {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
    validate: ValidateFunc<T>,

    setPristine: (pristine: boolean) => void,
    setError: (errors: SetErrorArg<Error<T>> | undefined) => void,
    setValue: (value: SetBaseValueArg<T>, partialUpdate?: boolean) => void,
    setFieldValue: (...entries: EntriesAsList<T>) => void,

    hasRestorePoint: boolean,
    restorePointValue: T,
    restorePointError: Error<T> | undefined,
    restorePointPristine: boolean,

    createRestorePoint: () => void;
    restore: () => void;
    clearRestorePoint: () => void;
};
function useForm<T, C>(
    schema: Schema<T, T, C>,
    initialState: {
        value: T,
        error?: Error<T>,
        pristine?: boolean,
    },
    context: C,
): {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
    validate: ValidateFunc<T>,

    setPristine: (pristine: boolean) => void,
    setError: (errors: SetErrorArg<Error<T>> | undefined) => void,
    setValue: (value: SetBaseValueArg<T>, partialUpdate?: boolean) => void,
    setFieldValue: (...entries: EntriesAsList<T>) => void,

    hasRestorePoint: boolean,
    restorePointValue: T,
    restorePointError: Error<T> | undefined,
    restorePointPristine: boolean,

    createRestorePoint: () => void;
    restore: () => void;
    clearRestorePoint: () => void;
} {
    const {
        value: initialFormValue,
        error: initialError,
        pristine: initialPristine = true,
    } = initialState;
    const formReducer = useCallback(
        (prevState: State<T>, action: Actions<T>): State<T> => {
            if (action.type === 'CREATE_RESTORE_POINT') {
                return {
                    ...prevState,
                    hasRestorePoint: true,
                    restorePointValue: prevState.value,
                    restorePointError: prevState.error,
                    restorePointPristine: prevState.pristine,
                };
            }
            if (action.type === 'RESTORE_RESTORE_POINT') {
                if (!prevState.hasRestorePoint) {
                    return prevState;
                }
                if (action.retain) {
                    return {
                        ...prevState,
                        value: prevState.restorePointValue,
                        error: prevState.restorePointError,
                        pristine: prevState.restorePointPristine,
                    };
                }
                return {
                    hasRestorePoint: false,
                    value: prevState.restorePointValue,
                    error: prevState.restorePointError,
                    pristine: prevState.restorePointPristine,
                };
            }
            if (action.type === 'CLEAR_RESTORE_POINT') {
                if (!prevState.hasRestorePoint) {
                    return prevState;
                }
                return {
                    hasRestorePoint: false,
                    value: prevState.value,
                    error: prevState.error,
                    pristine: prevState.pristine,
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
                const { error: errorFromAction } = action;

                const newErr = isCallable(errorFromAction)
                    ? errorFromAction(prevState.error)
                    : errorFromAction;

                return {
                    ...prevState,
                    error: newErr,
                };
            }
            if (action.type === 'SET_VALUE') {
                const {
                    value: valueFromAction,
                    partialUpdate,
                } = action;

                const newValue = isCallable(valueFromAction)
                    ? valueFromAction(prevState.value)
                    : valueFromAction;

                if (partialUpdate) {
                    const oldError = prevState.error;
                    const oldValue = prevState.value;

                    if (oldValue === newValue) {
                        return prevState;
                    }

                    const newError = accumulateDifferentialErrors(
                        oldValue,
                        newValue,
                        oldError,
                        schema,
                        newValue,
                        context,
                        false,
                    );

                    return {
                        ...prevState,
                        value: newValue,
                        error: newError,
                        pristine: false,
                    };
                }

                return {
                    ...prevState,
                    value: newValue,
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
                    newValue,
                    context,
                    false,
                );

                return {
                    ...prevState,
                    value: newValue,
                    error: newError,
                    pristine: false,
                };
            }
            // eslint-disable-next-line no-console
            console.error('Action is not supported');
            return prevState;
        },
        [schema, context],
    );

    const [state, dispatch] = useReducer(
        formReducer,
        {
            value: initialFormValue,
            error: initialError,
            pristine: initialPristine,
            hasRestorePoint: false,
        },
    );

    const createRestorePoint = useCallback(
        () => {
            const action: CreateRestorePointAction = {
                type: 'CREATE_RESTORE_POINT',
            };
            dispatch(action);
        },
        [],
    );

    const restore = useCallback(
        (retain = false) => {
            const action: RestoreRestorePointAction = {
                type: 'RESTORE_RESTORE_POINT',
                retain,
            };
            dispatch(action);
        },
        [],
    );

    const clearRestorePoint = useCallback(
        () => {
            const action: ClearRestorePointAction = {
                type: 'CLEAR_RESTORE_POINT',
            };
            dispatch(action);
        },
        [],
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
        (errors: SetErrorArg<Error<T>> | undefined) => {
            const action: ErrorAction<T> = {
                type: 'SET_ERROR',
                error: errors,
            };
            dispatch(action);
        },
        [],
    );

    const setValue = useCallback(
        (value: SetBaseValueArg<T>, partialUpdate: boolean | undefined) => {
            const action: ValueAction<T> = {
                type: 'SET_VALUE',
                value,
                partialUpdate,
            };
            dispatch(action);
        },
        [],
    );

    const setFieldValue = useCallback(
        (...entries: EntriesAsList<T>) => {
            const [value, key] = entries;
            const action: ValueFieldAction<T> = {
                type: 'SET_VALUE_FIELD',
                key,
                value,
            };
            dispatch(action);
        },
        [],
    );

    const validate: ValidateFunc<T> = useCallback(
        (accumulateOnError?: boolean) => {
            const stateErrors = accumulateErrors(state.value, schema, state.value, context);
            const stateErrored = analyzeErrors(stateErrors);
            if (stateErrored) {
                const value = accumulateOnError
                    ? accumulateValues(
                        state.value,
                        schema,
                        state.value,
                        context,
                        { nullable: true },
                    ) : undefined;
                return { errored: true, error: stateErrors as Error<T>, value };
            }
            // NOTE: server needs `null` to identify that the value is not defined
            const validatedValues = accumulateValues(
                state.value,
                schema,
                state.value,
                context,
                { nullable: true },
            );
            return { errored: false, value: validatedValues, error: undefined };
        },
        [schema, state, context],
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

        hasRestorePoint: state.hasRestorePoint,
        restorePointValue: state.hasRestorePoint ? state.restorePointValue : state.value,
        restorePointError: state.hasRestorePoint ? state.restorePointError : state.error,
        restorePointPristine: state.hasRestorePoint ? state.restorePointPristine : state.pristine,

        createRestorePoint,
        restore,
        clearRestorePoint,
    };
}

export function useFormObject<K, T>(
    name: K,
    onChange: (value: SetValueArg<T>, name: K) => void,
    defaultValue: NonNullable<T> | (() => NonNullable<T>),
) {
    const setFieldValue = useCallback(
        (...entries: EntriesAsList<NonNullable<T>>) => {
            // NOTE: there was a weird issue when using isCallable after
            // typescript upgrade. So using a specific isNotCallable here
            function isNotCallable(
                value: SetValueArg<NonNullable<T>[keyof NonNullable<T>]>,
            ): value is NonNullable<T>[keyof NonNullable<T>] {
                return typeof value !== 'function';
            }

            // NOTE: may need to cast callableValue here
            const [callableValue, key] = entries;
            onChange(
                (oldValue: T | undefined): T => {
                    const baseValue = oldValue ?? (
                        isCallable(defaultValue)
                            ? defaultValue()
                            : defaultValue
                    );
                    const val = baseValue[key];
                    return {
                        ...baseValue,
                        [key]: isNotCallable(callableValue)
                            ? callableValue
                            : callableValue(val),
                    };
                },
                name,
            );
        },
        [name, defaultValue, onChange],
    );

    return setFieldValue;
}

export function useFormArray<K, T>(
    name: K,
    onChange: (
        newValue: SetValueArg<T[]>,
        inputName: K,
    ) => void,
) {
    const setValue = useCallback(
        (val: SetValueArg<T>, index: number | undefined) => {
            onChange(
                (oldValue: T[] | undefined): T[] => {
                    const newVal = [...(oldValue ?? [])];
                    if (isNotDefined(index)) {
                        newVal.push(isCallable(val) ? val(undefined) : val);
                    } else {
                        newVal[index] = isCallable(val)
                            ? val(newVal[index])
                            : val;
                    }
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
                (oldValue: T[] | undefined): T[] => {
                    if (!oldValue) {
                        return [];
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

export default useForm;
