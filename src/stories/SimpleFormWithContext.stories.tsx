import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    Checkbox,
} from '@togglecorp/toggle-ui';

import { createSubmitHandler } from '../submissionHelper';
import useForm from '../form';
import type { PartialForm } from '../types';
import { internal } from '../types';
import type { ObjectSchema } from '../schema';
import FormContainer from './FormContainer';
import {
    requiredStringCondition,
    forceUndefinedType,
} from '../validation';
import { getErrorObject } from '../errorAccessHelper';

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
        name: [requiredStringCondition],
        email: [requiredStringCondition],
        shouldChangeEmail: [forceUndefinedType],
        shouldChangeName: [forceUndefinedType],
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

export const Default = () => {
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: previousValue }, previousValue);

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
                <div>
                    <div>
                        Previous Value:
                    </div>
                    <div>
                        {JSON.stringify(previousValue)}
                    </div>
                </div>
                <p>
                    {error?.[internal]}
                </p>
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
};

export default {
    title: 'Form/Simple Form With Context',
};
