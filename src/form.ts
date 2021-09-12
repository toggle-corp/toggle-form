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
    SetBaseValueArg,
    EntriesAsKeyValue,
    EntriesAsList,
} from './types';
import { isBaseCallable, isCallable } from './utils';

interface CreateCheckPointAction {
    type: 'CREATE_CHECKPOINT';
}
interface RestoreCheckPointAction {
    type: 'RESTORE_CHECKPOINT';
    retain: boolean,
}
interface ClearCheckPointAction {
    type: 'CLEAR_CHECKPOINT';
}
// eslint-disable-next-line @typescript-eslint/ban-types
interface ErrorAction<T extends object> {
    type: 'SET_ERROR';
    error: Error<T> | undefined;
}
// eslint-disable-next-line @typescript-eslint/ban-types
interface ValueAction<T extends object> {
    type: 'SET_VALUE';
    value: SetBaseValueArg<T>;
    doNotReset: boolean | undefined;
}
interface PristineAction {
    type: 'SET_PRISTINE';
    value: boolean;
}
// eslint-disable-next-line @typescript-eslint/ban-types
type ValueFieldAction<T extends object> = EntriesAsKeyValue<T> & { type: 'SET_VALUE_FIELD' };

// eslint-disable-next-line @typescript-eslint/ban-types
type Actions<T extends object> = ValueFieldAction<T>
    | ErrorAction<T>
    | ValueAction<T>
    | PristineAction
    | CreateCheckPointAction
    | RestoreCheckPointAction
    | ClearCheckPointAction;

export type ValidateFunc<T> = (accumulateOnError?: boolean) => (
    { errored: true, error: Error<T>, value: unknown }
    | { errored: false, value: T, error: undefined }
)

type State<T> = {
    value: T,
    error: Error<T> | undefined,
    pristine: boolean,
} & ({
    checkpoint: true,
    checkpointValue: T,
    checkpointError: Error<T> | undefined,
    checkpointPristine: boolean,
} | {
    checkpoint: false,
});

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
    setValue: (value: SetBaseValueArg<T>, doNotReset?: boolean) => void,
    setFieldValue: (...entries: EntriesAsList<T>) => void,

    checkpoint: boolean,
    checkpointValue: T,
    checkpointError: Error<T> | undefined,
    checkpointPristine: boolean,

    createCheckpoint: () => void;
    restoreCheckpoint: () => void;
    clearCheckpoint: () => void;
} {
    const formReducer = useCallback(
        (prevState: State<T>, action: Actions<T>): State<T> => {
            if (action.type === 'CREATE_CHECKPOINT') {
                return {
                    ...prevState,
                    checkpoint: true,
                    checkpointValue: prevState.value,
                    checkpointError: prevState.error,
                    checkpointPristine: prevState.pristine,
                };
            }
            if (action.type === 'RESTORE_CHECKPOINT') {
                if (!prevState.checkpoint) {
                    return prevState;
                }
                if (action.retain) {
                    return {
                        ...prevState,
                        value: prevState.checkpointValue,
                        error: prevState.checkpointError,
                        pristine: prevState.checkpointPristine,
                    };
                }
                return {
                    checkpoint: false,
                    value: prevState.checkpointValue,
                    error: prevState.checkpointError,
                    pristine: prevState.checkpointPristine,
                };
            }
            if (action.type === 'CLEAR_CHECKPOINT') {
                if (!prevState.checkpoint) {
                    return prevState;
                }
                return {
                    checkpoint: false,
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

                const newVal = isBaseCallable(valueFromAction)
                    ? valueFromAction(prevState.value)
                    : valueFromAction;

                if (doNotReset) {
                    return {
                        ...prevState,
                        value: newVal,
                    };
                }

                return {
                    ...prevState,
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
                    ...prevState,
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
        {
            value: initialFormValue,
            error: initialError,
            pristine: initialPristine,
            checkpoint: false,
        },
    );

    const createCheckpoint = useCallback(
        () => {
            const action: CreateCheckPointAction = {
                type: 'CREATE_CHECKPOINT',
            };
            dispatch(action);
        },
        [],
    );

    const restoreCheckpoint = useCallback(
        (retain = false) => {
            const action: RestoreCheckPointAction = {
                type: 'RESTORE_CHECKPOINT',
                retain,
            };
            dispatch(action);
        },
        [],
    );

    const clearCheckpoint = useCallback(
        () => {
            const action: ClearCheckPointAction = {
                type: 'CLEAR_CHECKPOINT',
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
        (errors: Error<T> | undefined) => {
            const action: ErrorAction<T> = {
                type: 'SET_ERROR',
                error: errors,
            };
            dispatch(action);
        },
        [],
    );

    const setValue = useCallback(
        (value: SetBaseValueArg<T>, doNotReset: boolean | undefined) => {
            const action: ValueAction<T> = {
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
            const stateErrors = accumulateErrors(state.value, schema);
            const stateErrored = analyzeErrors(stateErrors);
            if (stateErrored) {
                const value = accumulateOnError
                    ? accumulateValues(state.value, schema, { nullable: true })
                    : undefined;
                return { errored: true, error: stateErrors as Error<T>, value };
            }
            // NOTE: server needs `null` to identify that the value is not defined
            const validatedValues = accumulateValues(state.value, schema, { nullable: true });
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

        checkpoint: state.checkpoint,
        checkpointValue: state.checkpoint ? state.checkpointValue : state.value,
        checkpointError: state.checkpoint ? state.checkpointError : state.error,
        checkpointPristine: state.checkpoint ? state.checkpointPristine : state.pristine,

        createCheckpoint,
        restoreCheckpoint,
        clearCheckpoint,
    };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormObject<K extends string | number | undefined, T extends object | undefined>(
    name: K,
    onChange: (value: SetValueArg<T>, name: K) => void,
    defaultValue: NonNullable<T> | (() => NonNullable<T>),
) {
    const setFieldValue = useCallback(
        (...entries: EntriesAsList<NonNullable<T>>) => {
            // NOTE: may need to cast callableValue here
            const [callableValue, key] = entries;
            onChange(
                (oldValue: T | undefined): T => {
                    const baseValue = oldValue ?? (
                        isCallable(defaultValue)
                            ? defaultValue()
                            : defaultValue
                    );
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
export function useFormArray<K extends string | number | undefined, T extends object>(
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
