import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    Checkbox,
} from '@togglecorp/toggle-ui';
import {
    type PartialForm,
    type ObjectSchema,
    useForm,
    createSubmitHandler,
    nonFieldError,
    getErrorObject,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import NonFieldError from './NonFieldError';
import FormContainer from './FormContainer';

type FormType = {
    name?: string;
    email?: string;

    shouldChangeName?: boolean;
    shouldChangeEmail?: boolean;
};
type PartForm =PartialForm<FormType>;
type FormSchema = ObjectSchema<PartForm, PartForm, FormType>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema : FormSchema = {
    fields: (): FormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        shouldChangeEmail: {
            forceValue: undefinedValue,
        },
        shouldChangeName: {
            forceValue: undefinedValue,
        },
    }),

    validation: (value, _, context) => {
        const errors: string[] = [];
        if (value?.shouldChangeName && value.name === context.name) {
            errors.push('Name was not changed');
        }

        if (value?.shouldChangeEmail && value.email === context.email) {
            errors.push('Email was not changed');
        }

        if (errors.length > 0) {
            return errors.join(', ');
        }

        return undefined;
    },
};

const previousValue: FormType = { name: 'Ram', email: 'info@togglecorp.com' };

export function Default() {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: previousValue }, previousValue);

    const handleSubmit = useCallback((finalValues: PartialForm<FormType>) => {
        setValue(finalValues);
    }, [setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer
            value={value}
            prevValue={previousValue}
        >
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <NonFieldError
                    value={error?.[nonFieldError]}
                />
                <Checkbox
                    name="shouldChangeName"
                    label="Do you want to change the name?"
                    value={value.shouldChangeName}
                    onChange={setFieldValue}
                />
                <TextInput
                    label="Name"
                    name="name"
                    value={value.name}
                    onChange={setFieldValue}
                    error={error?.name}
                />
                <Checkbox
                    name="shouldChangeEmail"
                    label="Do you want to change the email?"
                    value={value.shouldChangeEmail}
                    onChange={setFieldValue}
                />
                <TextInput
                    label="Email"
                    name="email"
                    value={value.email}
                    onChange={setFieldValue}
                    error={error?.email}
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
}

export default {
    title: 'Form/Simple Form With Context',
};
