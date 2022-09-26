import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    DateInput,
} from '@togglecorp/toggle-ui';

import useForm from '../form';
import { createSubmitHandler } from '../submissionHelper';
import type { ObjectSchema } from '../schema';
import { internal } from '../types';
import { addCondition } from '../schema';
import type { PartialForm } from '../types';
import FormContainer from './FormContainer';
import { getErrorObject } from '../errorAccessHelper';
import { requiredStringCondition } from '../validation';

type FormType = {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
};

type PartForm = PartialForm<FormType>;

type FormSchema = ObjectSchema<PartForm>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        const baseSchema: FormSchemaFields = {
            firstName: [],
            lastName: [],
            birthDate: [],
        };
        const newSchema = addCondition(
            baseSchema,
            value,
            ['birthDate'] as const,
            ['birthPlace'] as const,
            (props) => (props?.birthDate ? {
                birthPlace: [requiredStringCondition],
            } : {
                birthPlace: [],
            }),
        );
        return newSchema;
    },
};

const defaultFormValues: PartialForm<FormType> = {
    birthDate: '2012-10-21',
};

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
                    label="First name"
                    name="firstName"
                    value={value.firstName}
                    onChange={setFieldValue}
                    error={error?.firstName}
                />
                <TextInput
                    label="Last name"
                    name="lastName"
                    value={value.lastName}
                    onChange={setFieldValue}
                    error={error?.lastName}
                />
                <DateInput
                    label="Birth date"
                    name="birthDate"
                    value={value.birthDate}
                    onChange={setFieldValue}
                    error={error?.birthDate}
                />
                <TextInput
                    label="Birth place"
                    name="birthPlace"
                    value={value.birthPlace}
                    onChange={setFieldValue}
                    error={error?.birthPlace}
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
    title: 'Form/FormWithDependentField',
};
