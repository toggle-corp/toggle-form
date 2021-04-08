import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Checkbox,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { PartialForm } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { requiredStringCondition, requiredCondition, nullCondition } from '../validation';

type FormType = {
    firstName: string;
    lastName: string;
    detailed?: boolean;
    age?: number;
    job?: string;
    address?: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
            firstName: [requiredStringCondition],
            lastName: [],
            detailed: [],
            job: [nullCondition],
            age: [nullCondition],
            address: [nullCondition],
        };
        if (value.detailed) {
            baseSchema = {
                ...baseSchema,
                job: [],
                age: [requiredCondition],
                address: [requiredStringCondition],
            };
        }
        return baseSchema;
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
                    label="First Name *"
                    name="firstName"
                    value={value.firstName}
                    onChange={onValueChange}
                    error={error?.fields?.firstName}
                />
                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={value.lastName}
                    onChange={onValueChange}
                    error={error?.fields?.lastName}
                />
                <Checkbox
                    label="I can add more details"
                    name="detailed"
                    value={value.detailed}
                    onChange={onValueChange}
                    // error={error?.fields?.detailed}
                />
                {value.detailed && (
                    <>
                        <TextInput
                            label="Address *"
                            name="address"
                            value={value.address}
                            onChange={onValueChange}
                            error={error?.fields?.address}
                        />
                        <NumberInput
                            label="Age *"
                            name="age"
                            value={value.age}
                            onChange={onValueChange}
                            error={error?.fields?.age}
                        />
                        <TextInput
                            label="Job"
                            name="job"
                            value={value.job}
                            onChange={onValueChange}
                            error={error?.fields?.job}
                        />
                    </>
                )}
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
    title: 'Form/Conditional Form',
};
