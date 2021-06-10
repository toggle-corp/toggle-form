import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    PasswordInput,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { PartialForm } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { requiredStringCondition } from '../validation';

type FormType = {
    username?: string;
    password?: string;
    confirmPassword?: string;
};
type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [],
        password: [],
    }),
};

const schemaWithValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [requiredStringCondition],
        password: [requiredStringCondition],
    }),
};

const schemaWithCustomValidation: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [requiredStringCondition],
        password: [requiredStringCondition],
        confirmPassword: [requiredStringCondition],
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
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(defaultFormValues, schema);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            onValueSet(finalValues);
        }, [onValueSet],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.$internal}
                </p>
                <TextInput
                    label="Username"
                    name="username"
                    value={value.username}
                    onChange={onValueChange}
                    error={error?.fields?.username}
                />
                <PasswordInput
                    label="Password"
                    name="password"
                    value={value.password}
                    onChange={onValueChange}
                    error={error?.fields?.password}
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
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(defaultFormValues, schemaWithValidation);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            onValueSet(finalValues);
        }, [onValueSet],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.$internal}
                </p>
                <TextInput
                    label="Username *"
                    name="username"
                    value={value.username}
                    onChange={onValueChange}
                    error={error?.fields?.username}
                />
                <PasswordInput
                    label="Password *"
                    name="password"
                    value={value.password}
                    onChange={onValueChange}
                    error={error?.fields?.password}
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
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(defaultFormValues, schemaWithCustomValidation);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            onValueSet(finalValues);
        }, [onValueSet],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.$internal}
                </p>
                <TextInput
                    label="Username *"
                    name="username"
                    value={value.username}
                    onChange={onValueChange}
                    error={error?.fields?.username}
                />
                <PasswordInput
                    label="Password *"
                    name="password"
                    value={value.password}
                    onChange={onValueChange}
                    error={error?.fields?.password}
                />
                <PasswordInput
                    label="Confirm Password *"
                    name="confirmPassword"
                    value={value.confirmPassword}
                    onChange={onValueChange}
                    error={error?.fields?.confirmPassword}
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
