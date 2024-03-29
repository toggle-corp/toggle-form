import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
} from '@togglecorp/toggle-ui';
import {
    type PartialForm,
    type ObjectSchema,
    useForm,
    createSubmitHandler,
    nonFieldError,
    getErrorObject,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import FormContainer from './FormContainer';
import NonFieldError from './NonFieldError';

type FormType = {
    step: number;

    firstName: string;
    lastName: string;

    age?: number;
    job?: string;
    address?: string;
};

type PartForm = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartForm, PartForm, number>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (_, __, step): FormSchemaFields => {
        let baseSchema: FormSchemaFields = {
            firstName: {},
            lastName: {},
            job: {},
            age: {},
            address: {},
        };

        if (step >= 1) {
            baseSchema = {
                ...baseSchema,
                firstName: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                },
                lastName: {},
            };
        }

        if (step === 2) {
            baseSchema = {
                ...baseSchema,
                job: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                },
                age: {
                    required: true,
                },
                address: {},
            };
        }

        return baseSchema;
    },
};

const defaultFormValues: PartialForm<FormType> = {
};

export function Default() {
    const [step, setStep] = React.useState(1);
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues }, step);

    const handleSubmit = useCallback((finalValues: PartialForm<FormType>) => {
        if (step === 1) {
            setStep(2);
        } else {
            setValue(finalValues);
        }
    }, [step, setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <NonFieldError
                    value={error?.[nonFieldError]}
                />
                {step === 1 && (
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
                {step === 2 && (
                    <>
                        <TextInput
                            label="Address"
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
                            label="Job*"
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
                    {step === 1 ? 'Next' : 'Submit'}
                </Button>
            </form>
        </FormContainer>
    );
}

export default {
    title: 'Form/Stepwise Form',
};
