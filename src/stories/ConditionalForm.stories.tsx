import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Checkbox,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { PartialForm } from '../types';
import { internal } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { getErrorObject } from '../utils';
import { requiredStringCondition, requiredCondition, forceNullType } from '../validation';

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
            job: [forceNullType],
            age: [forceNullType],
            address: [forceNullType],
        };
        if (value?.detailed) {
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
        error: riskyError,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(schema, defaultFormValues);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            onValueSet(finalValues);
        }, [onValueSet],
    );

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.[internal]}
                </p>
                <TextInput
                    label="First Name *"
                    name="firstName"
                    value={value.firstName}
                    onChange={onValueChange}
                    error={error?.firstName}
                />
                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={value.lastName}
                    onChange={onValueChange}
                    error={error?.lastName}
                />
                <Checkbox
                    label="I can add more details"
                    name="detailed"
                    value={value.detailed}
                    onChange={onValueChange}
                    // error={error?.detailed}
                />
                {value.detailed && (
                    <>
                        <TextInput
                            label="Address *"
                            name="address"
                            value={value.address}
                            onChange={onValueChange}
                            error={error?.address}
                        />
                        <NumberInput
                            label="Age *"
                            name="age"
                            value={value.age}
                            onChange={onValueChange}
                            error={error?.age}
                        />
                        <TextInput
                            label="Job"
                            name="job"
                            value={value.job}
                            onChange={onValueChange}
                            error={error?.job}
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
