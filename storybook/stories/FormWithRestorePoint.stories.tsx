import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    PasswordInput,
    MultiSelectInput,
} from '@togglecorp/toggle-ui';
import {
    type PartialForm,
    type ObjectSchema,
    useForm,
    createSubmitHandler,
    nonFieldError,
    getErrorObject,
    getErrorString,
    requiredListCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import FormContainer, { EquiRow } from './FormContainer';
import NonFieldError from './NonFieldError';

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
type PartForm = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartForm>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schemaWithValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        interests: {
            required: true,
            requiredValidation: requiredListCondition,
        },
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

export function Default() {
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
    } = useForm(schemaWithValidation, { value: defaultFormValues });

    const handleErrorToggle = useCallback(
        () => {
            setError((oldError) => {
                if (typeof oldError === 'string') {
                    return oldError ? undefined : 'I like errors';
                }

                if (oldError) {
                    return {
                        ...oldError,
                        [nonFieldError]: oldError[nonFieldError] ? undefined : 'I like errors',
                    };
                }

                return 'I like errors';
            });
        },
        [setError],
    );

    const handleSubmit = useCallback((finalValues: PartialForm<FormType>) => {
        setValue(finalValues);
    }, [setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <NonFieldError
                    value={error?.[nonFieldError]}
                />
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
                <EquiRow>
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
                </EquiRow>
            </form>
        </FormContainer>
    );
}

export default {
    title: 'Form/Form with Restore point',
};
