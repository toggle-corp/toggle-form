import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Checkbox,
} from '@togglecorp/toggle-ui';
import {
    type PartialForm,
    type ObjectSchema,
    useForm,
    createSubmitHandler,
    nullValue,
    nonFieldError,
    addCondition,
    getErrorObject,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import FormContainer from './FormContainer';
import NonFieldError from './NonFieldError';

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

// `addCondition` force-hides job/age/address (forceValue: nullValue) unless `detailed` is
// checked. `useForm` derives a `visibility` map from that schema (via `accumulateVisibility`),
// so the JSX reads `visibility.field` instead of repeating the `value.detailed` condition —
// show/hide logic lives in one place (the schema). Compare with the ConditionalForm story,
// which duplicates `{value.detailed && ...}` in the markup.
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

        return addCondition(
            baseSchema,
            value,
            ['detailed'],
            ['job', 'age', 'address'],
            (props) => (props?.detailed ? {
                job: {},
                age: { required: true },
                address: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                },
            } : {
                job: { forceValue: nullValue },
                age: { forceValue: nullValue },
                address: { forceValue: nullValue },
            }),
        );
    },
};

const defaultFormValues: PartForm = {};

export function Default() {
    const {
        pristine,
        value,
        error: riskyError,
        visibility,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues });

    const handleSubmit = useCallback((finalValues: PartForm) => {
        setValue(finalValues);
    }, [setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form onSubmit={createSubmitHandler(validate, setError, handleSubmit)}>
                <NonFieldError value={error?.[nonFieldError]} />
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
                {visibility.address && (
                    <TextInput
                        label="Address *"
                        name="address"
                        value={value.address}
                        onChange={setFieldValue}
                        error={error?.address}
                    />
                )}
                {visibility.age && (
                    <NumberInput
                        label="Age *"
                        name="age"
                        value={value.age}
                        onChange={setFieldValue}
                        error={error?.age}
                    />
                )}
                {visibility.job && (
                    <TextInput
                        label="Job"
                        name="job"
                        value={value.job}
                        onChange={setFieldValue}
                        error={error?.job}
                    />
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
    title: 'Form/Visibility',
};
