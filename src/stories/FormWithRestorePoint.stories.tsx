import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    PasswordInput,
    MultiSelectInput,
} from '@togglecorp/toggle-ui';

import { createSubmitHandler } from '../submissionHelper';
import useForm from '../form';
import type { PartialForm } from '../types';
import { internal } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import {
    requiredStringCondition,
    requiredListCondition,
} from '../validation';
import { getErrorObject, getErrorString } from '../errorAccessHelper';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    { key: '1', label: 'Music' },
    { key: '2', label: 'Dance' },
    { key: '3', label: 'Gardening' },
    { key: '4', label: 'Pottery' },
    { key: '5', label: 'Painting' },
];

type FormType = {
    username?: string;
    password?: string;
    confirmPassword?: string;
    interests?: string[];
};
type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schemaWithValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [requiredStringCondition],
        password: [requiredStringCondition],
        interests: [requiredListCondition],
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

export const Default = () => {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,

        hasRestorePoint,
        restore,
        createRestorePoint,
        clearRestorePoint,
    } = useForm(schemaWithValidation, defaultFormValues);

    const handleErrorToggle = useCallback(
        () => {
            setError((oldError) => {
                if (typeof oldError === 'string') {
                    return oldError ? undefined : 'I like errors';
                }

                if (oldError) {
                    return {
                        ...oldError,
                        [internal]: oldError[internal] ? undefined : 'I like errors',
                    };
                }

                return 'I like errors';
            });
        },
        [setError],
    );

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            setValue(finalValues);
        }, [setValue],
    );

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <p>
                    {error?.[internal]}
                </p>
                <TextInput
                    label="Username *"
                    name="username"
                    value={value.username}
                    onChange={setFieldValue}
                    error={error?.username}
                />
                <MultiSelectInput
                    label="Interests"
                    name="interests"
                    options={options}
                    value={value.interests}
                    onChange={setFieldValue}
                    keySelector={(d) => d.key}
                    labelSelector={(d) => d.label}
                    error={getErrorString(error?.interests)}
                />
                <PasswordInput
                    label="Password *"
                    name="password"
                    value={value.password}
                    onChange={setFieldValue}
                    error={error?.password}
                />
                <div>
                    <Button
                        type="submit"
                        name={undefined}
                        variant="primary"
                        disabled={pristine}
                    >
                        Submit
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleErrorToggle}
                    >
                        Toggle error
                    </Button>
                    {!hasRestorePoint && (
                        <Button
                            name={undefined}
                            onClick={createRestorePoint}
                        >
                            Create Restore Point
                        </Button>
                    )}
                    {hasRestorePoint && (
                        <>
                            <Button
                                name={undefined}
                                onClick={restore}
                            >
                                Restore
                            </Button>
                            <Button
                                name={undefined}
                                onClick={clearRestorePoint}
                            >
                                Clear Restore Point
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </FormContainer>
    );
};

export default {
    title: 'Form/Form with Restore point',
};
