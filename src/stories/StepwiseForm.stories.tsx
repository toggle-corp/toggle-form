import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { PartialForm } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { requiredStringCondition, requiredCondition, nullCondition } from '../validation';

type FormType = {
    step: number;

    firstName: string;
    lastName: string;

    age?: number;
    job?: string;
    address?: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
            step: [],
            firstName: [nullCondition],
            lastName: [nullCondition],
            job: [nullCondition],
            age: [nullCondition],
            address: [nullCondition],
        };
        if (value.step === 1) {
            baseSchema = {
                ...baseSchema,
                firstName: [requiredStringCondition],
                lastName: [],
            };
        }
        if (value.step === 2) {
            baseSchema = {
                ...baseSchema,
                job: [requiredStringCondition],
                age: [requiredCondition],
                address: [],
            };
        }
        return baseSchema;
    },
};

const defaultFormValues: PartialForm<FormType> = {
    step: 1,
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
            if (finalValues.step === 1) {
                onValueSet((val) => ({ ...val, step: 2 }));
            } else {
                onValueSet(finalValues);
            }
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
                {value.step === 1 && (
                    <>
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
                    </>
                )}
                {value.step === 2 && (
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
    title: 'Form/Stepwise Form',
};
