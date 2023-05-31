import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Checkbox,
} from '@togglecorp/toggle-ui';

import useForm from '../../lib/src/form';
import { createSubmitHandler } from '../../lib/src/submissionHelper';
import type { PartialForm } from '../../lib/src/types';
import { nullValue, nonFieldError } from '../../lib/src/types';
import { addCondition } from '../../lib/src/schema';
import type { ObjectSchema } from '../../lib/src/schema';
import FormContainer from './FormContainer';
import NonFieldError from './NonFieldError';
import { getErrorObject } from '../../lib/src/errorAccessHelper';
import { requiredStringCondition } from '../../lib/src/validation';

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
        const baseSchema: FormSchemaFields = {
            firstName: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            lastName: {},
            detailed: {},
        };

        const newSchema = addCondition(
            baseSchema,
            value,
            ['detailed'],
            ['job', 'age', 'address'],
            (props) => (props?.detailed ? {
                job: {},
                age: {
                    required: true,
                },
                address: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                },
            } : {
                job: {
                    forceValue: nullValue,
                },
                age: {
                    forceValue: nullValue,
                },
                address: {
                    forceValue: nullValue,
                },
            }),
        );
        return newSchema;
    },
};

const defaultFormValues: PartialForm<FormType> = {};

export function Default() {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues });

    const handleSubmit = useCallback((finalValues: PartialForm<FormType>) => {
        setValue(finalValues);
    }, [setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <NonFieldError
                    value={error?.[nonFieldError]}
                />
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
}

export default {
    title: 'Form/Conditional Form',
};
