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
type PartForm =PartialForm<FormType>;
type FormSchema = ObjectSchema<PartForm>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [],
        password: [],
        interests: [],
    }),
};

const schemaWithValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [requiredStringCondition],
        password: [requiredStringCondition],
        interests: [requiredListCondition],
    }),
};

const schemaWithCustomValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [requiredStringCondition],
        password: [requiredStringCondition],
        confirmPassword: [requiredStringCondition],
        interests: [requiredListCondition],
    }),
    validation: (value) => {
        if (
            value
            && value.password
            && value.confirmPassword
            && value.password !== value.confirmPassword
        ) {
            return 'The passwords do not match.';
        }
        return undefined;
    },
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
    } = useForm(schema, { value: defaultFormValues });

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
                    label="Username"
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
                    label="Password"
                    name="password"
                    value={value.password}
                    onChange={setFieldValue}
                    error={error?.password}
                />
                <Button
                    type="submit"
                    name={undefined}
                    variant="primary"
                    disabled={pristine}
                >
                    Submit
                </Button>
            </form>
        </FormContainer>
    );
};

export const WithValidation = () => {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schemaWithValidation, { value: defaultFormValues });

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
                <Button
                    type="submit"
                    name={undefined}
                    variant="primary"
                    disabled={pristine}
                >
                    Submit
                </Button>
            </form>
        </FormContainer>
    );
};

export const WithCustomValidation = () => {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schemaWithCustomValidation, { value: defaultFormValues });

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
                <PasswordInput
                    label="Confirm Password *"
                    name="confirmPassword"
                    value={value.confirmPassword}
                    onChange={setFieldValue}
                    error={error?.confirmPassword}
                />
                <Button
                    type="submit"
                    name={undefined}
                    variant="primary"
                    disabled={pristine}
                >
                    Submit
                </Button>
            </form>
        </FormContainer>
    );
};

export default {
    title: 'Form/Simple Form',
};
