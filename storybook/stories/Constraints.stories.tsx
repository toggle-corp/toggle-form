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
    createRequiredStringCondition,
} from '@togglecorp/toggle-form';

import FormContainer from './FormContainer';
import NonFieldError from './NonFieldError';

type FormType = {
    username?: string;
    age?: number;
    bio?: string;
};

type PartForm = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartForm>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

// Built-in constraints (maxLength/minLength/min/max/integer) live on the schema as a
// single source of truth: they are validated automatically by `accumulateErrors`, and
// `useForm` also exposes them through `constraints` (via `accumulateConstraints`) so the
// matching input attributes are driven from the very same definition.
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: requiredStringCondition,
            minLength: 3,
            maxLength: 12,
        },
        age: {
            required: true,
            min: 18,
            max: 99,
            integer: true,
        },
        bio: {
            maxLength: 140,
        },
    }),
};

// Identical constraints, but with custom / translatable error messages. A message can be
// a plain (pre-translated) string, or a function that receives the constraint value.
const schemaWithMessages: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: createRequiredStringCondition('Please enter a username'),
            minLength: 3,
            maxLength: 12,
            messages: {
                minLength: (n) => `Username must be at least ${n} characters`,
                maxLength: (n) => `Username may not exceed ${n} characters`,
            },
        },
        age: {
            required: true,
            min: 18,
            max: 99,
            integer: true,
            messages: {
                min: (n) => `You must be at least ${n}`,
                max: (n) => `Maximum allowed age is ${n}`,
                integer: 'Age must be a whole number',
            },
        },
        bio: {
            maxLength: 140,
        },
    }),
};

const defaultFormValues: PartForm = {};

// A live character counter driven by the SAME maxLength constraint. Change `maxLength` once
// in the schema and the counter, the input's maxLength attribute, and validation all move
// together — which is the whole point of keeping the constraint on the schema.
function charCountHint(value: string | undefined, max: number | undefined) {
    if (max === undefined) {
        return undefined;
    }
    return `${value?.length ?? 0} / ${max}`;
}

interface ConstraintsFormProps {
    schema: FormSchema;
}

function ConstraintsForm(props: ConstraintsFormProps) {
    const { schema: formSchema } = props;

    const {
        pristine,
        value,
        error: riskyError,
        constraints,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(formSchema, { value: defaultFormValues });

    const handleSubmit = useCallback((finalValues: PartForm) => {
        setValue(finalValues);
    }, [setValue]);

    const error = getErrorObject(riskyError);

    return (
        <FormContainer value={value}>
            <form onSubmit={createSubmitHandler(validate, setError, handleSubmit)}>
                <NonFieldError value={error?.[nonFieldError]} />
                <TextInput
                    label="Username *"
                    name="username"
                    value={value.username}
                    onChange={setFieldValue}
                    error={error?.username}
                    hint={charCountHint(value.username, constraints.username?.maxLength)}
                    minLength={constraints.username?.minLength}
                    maxLength={constraints.username?.maxLength}
                />
                <NumberInput
                    label="Age *"
                    name="age"
                    value={value.age}
                    onChange={setFieldValue}
                    error={error?.age}
                    min={constraints.age?.min}
                    max={constraints.age?.max}
                />
                <TextInput
                    label="Bio"
                    name="bio"
                    value={value.bio}
                    onChange={setFieldValue}
                    error={error?.bio}
                    hint={charCountHint(value.bio, constraints.bio?.maxLength)}
                    maxLength={constraints.bio?.maxLength}
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

export function Default() {
    return <ConstraintsForm schema={schema} />;
}

export function WithTranslatedMessages() {
    return <ConstraintsForm schema={schemaWithMessages} />;
}

export default {
    title: 'Form/Constraints',
};
