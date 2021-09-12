import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Button,
    TextInput,
    DateInput,
} from '@togglecorp/toggle-ui';

import useForm from '../form';
import { createSubmitHandler } from '../submissionHelper';
import type { ObjectSchema } from '../schema';
import { internal } from '../types';
import type { PartialForm } from '../types';
import FormContainer from './FormContainer';
import { getErrorObject } from '../errorAccessHelper';

type FormType = {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

function requiredWithBirthDateCondition(
    birthPlace: string | undefined,
    value: PartialForm<FormType>,
) {
    if (isDefined(value.birthDate) && !isDefined(birthPlace)) {
        return 'Birth place is required when birth date is entered';
    }

    return undefined;
}

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        firstName: [],
        lastName: [],
        birthDate: [],
        birthPlace: [requiredWithBirthDateCondition],
    }),
    fieldDependencies: () => ({
        birthPlace: ['birthDate'],
    }),
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
    } = useForm(schema, defaultFormValues);

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
