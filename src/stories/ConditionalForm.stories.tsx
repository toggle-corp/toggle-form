import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Checkbox,
} from '@togglecorp/toggle-ui';

import useForm from '../form';
import { createSubmitHandler } from '../submissionHelper';
import type { PartialForm } from '../types';
import { internal } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import { getErrorObject } from '../errorAccessHelper';
import { requiredStringCondition, requiredCondition, forceNullType } from '../validation';

type FormType = {
    firstName: string;
    lastName: string;
    detailed?: boolean;
    age?: number;
    job?: string;
    address?: string;
};

type PartForm = PartialForm<FormType>;

type FormSchema = ObjectSchema<PartForm>;
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
                <Checkbox
                    label="I can add more details"
                    name="detailed"
                    value={value.detailed}
                    onChange={setFieldValue}
                    // error={error?.detailed}
                />
                {value.detailed && (
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
    title: 'Form/Conditional Form',
};
