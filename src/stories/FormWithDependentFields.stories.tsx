import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Button,
    TextInput,
    DateInput,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { ObjectSchema } from '../schema';
import type { PartialForm } from '../types';
import FormContainer from './FormContainer';

type FormType = {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

function testCondition(value: string | undefined) {
    return value;
}

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
        firstName: [testCondition],
        lastName: [],
        birthDate: [],
        birthPlace: [requiredWithBirthDateCondition],
    }),
    fieldDependencies: () => ({
        birthPlace: ['birthDate'],
    }),
};

const defaultFormValues: PartialForm<FormType> = {
    birthDate: 'Hello world',
};

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
                    label="First name"
                    name="firstName"
                    value={value.firstName}
                    onChange={onValueChange}
                    error={error?.fields?.firstName}
                />
                <TextInput
                    label="Last name"
                    name="lastName"
                    value={value.lastName}
                    onChange={onValueChange}
                    error={error?.fields?.lastName}
                />
                <DateInput
                    label="Birth date"
                    name="birthDate"
                    value={value.birthDate}
                    onChange={onValueChange}
                    error={error?.fields?.birthDate}
                />
                <TextInput
                    label="Birth place"
                    name="birthPlace"
                    value={value.birthPlace}
                    onChange={onValueChange}
                    error={error?.fields?.birthPlace}
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
