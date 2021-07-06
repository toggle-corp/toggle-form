import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
} from '@togglecorp/toggle-ui';

import useForm, { createSubmitHandler } from '../form';
import type { PartialForm } from '../types';
import { internal } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { getErrorObject } from '../utils';
import { requiredStringCondition, requiredCondition, forceNullType } from '../validation';

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
            firstName: [forceNullType],
            lastName: [forceNullType],
            job: [forceNullType],
            age: [forceNullType],
            address: [forceNullType],
        };
        if (value?.step === 1) {
            baseSchema = {
                ...baseSchema,
                firstName: [requiredStringCondition],
                lastName: [],
            };
        }
        if (value?.step === 2) {
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
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, defaultFormValues);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            if (finalValues.step === 1) {
                setValue((val) => ({ ...val, step: 2 }));
            } else {
                setValue(finalValues);
            }
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
                {value.step === 1 && (
                    <>
                        <TextInput
                            label="First Name *"
                            name="firstName"
                            value={value.firstName}
                            onChange={setFieldValue}
                            error={error?.firstName}
                        />
                        <TextInput
                            label="Last Name"
                            name="lastName"
                            value={value.lastName}
                            onChange={setFieldValue}
                            error={error?.lastName}
                        />
                    </>
                )}
                {value.step === 2 && (
                    <>
                        <TextInput
                            label="Address *"
                            name="address"
                            value={value.address}
                            onChange={setFieldValue}
                            error={error?.address}
                        />
                        <NumberInput
                            label="Age *"
                            name="age"
                            value={value.age}
                            onChange={setFieldValue}
                            error={error?.age}
                        />
                        <TextInput
                            label="Job"
                            name="job"
                            value={value.job}
                            onChange={setFieldValue}
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
    title: 'Form/Stepwise Form',
};
