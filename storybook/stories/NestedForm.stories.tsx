import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    DateInput,
} from '@togglecorp/toggle-ui';
import { randomString } from '@togglecorp/fujs';

import { createSubmitHandler } from '@togglecorp/toggle-form/src/submissionHelper';
import useForm, { useFormArray, useFormObject } from '@togglecorp/toggle-form/src/form';
import type { PartialForm as RawPartialForm, SetValueArg } from '@togglecorp/toggle-form/src/types';
import type { Error, ObjectSchema, ArraySchema } from '@togglecorp/toggle-form/src/schema';
import {
    requiredStringCondition,
    greaterThanCondition,
} from '@togglecorp/toggle-form/src/validation';
import { getErrorObject } from '@togglecorp/toggle-form/src/errorAccessHelper';
import { nonFieldError } from '@togglecorp/toggle-form/src/types';
import NonFieldError from './NonFieldError';
import FormContainer, { Row } from './FormContainer';

type PartialForm<T> = RawPartialForm<T, 'clientId'>;

type FormType = {
    name?: string;
    meta?: {
        age?: number;
        job?: string;
    };
    collections?: {
        clientId: string;
        date?: string;
        title?: string;
    }[];
};
type BaseFormType = PartialForm<FormType>;

type FormSchema = ObjectSchema<BaseFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type MetaType = NonNullable<FormType['meta']>;
type MetaSchema = ObjectSchema<PartialForm<MetaType>, BaseFormType>;
type MetaSchemaFields = ReturnType<MetaSchema['fields']>;
type CollectionType = NonNullable<NonNullable<FormType['collections']>>[number];
type CollectionSchema = ObjectSchema<PartialForm<CollectionType>, BaseFormType>;
type CollectionSchemaFields = ReturnType<CollectionSchema['fields']>;
type CollectionsSchema = ArraySchema<PartialForm<CollectionType>, BaseFormType>;
type CollectionsSchemaMember = ReturnType<CollectionsSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        meta: {
            fields: (): MetaSchemaFields => ({
                age: {
                    required: true,
                    validations: [greaterThanCondition(12)],
                },
                job: {},
            }),
        },
        collections: {
            keySelector: (col) => col.clientId,
            member: (): CollectionsSchemaMember => ({
                fields: (): CollectionSchemaFields => ({
                    clientId: {},
                    date: {},
                    title: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                }),
            }),
        },
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

type MetaInputValue = PartialForm<MetaType> | undefined;
interface MetaInputProps<K extends string | number> {
   name: K,
   value: MetaInputValue,
   error: Error<MetaType> | undefined;
   onChange: (value: SetValueArg<MetaInputValue> | undefined, name: K) => void;
}
const defaultMetaValue: NonNullable<MetaInputValue> = {};
function MetaInput<K extends string | number>(props: MetaInputProps<K>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultMetaValue);

    const error = getErrorObject(riskyError);

    return (
        <>
            <NonFieldError
                value={error?.[nonFieldError]}
            />
            <NumberInput
                label="Age *"
                name="age"
                value={value?.age}
                onChange={onFieldChange}
                error={error?.age}
            />
            <TextInput
                label="Job"
                name="job"
                value={value?.job}
                onChange={onFieldChange}
                error={error?.job}
            />
        </>
    );
}

const defaultCollectionValue: PartialForm<CollectionType> = {
    clientId: 'test',
};
interface CollectionInputProps {
   value: PartialForm<CollectionType>,
   error: Error<CollectionType> | undefined;
   onChange: (value: SetValueArg<PartialForm<CollectionType>>, index: number) => void;
   onRemove: (index: number) => void;
   index: number,
}
function CollectionInput(props: CollectionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultCollectionValue);

    const error = getErrorObject(riskyError);

    return (
        <>
            <Row>
                <h5>
                    {`Collection #${index + 1}`}
                </h5>
                <Button
                    name={index}
                    onClick={onRemove}
                    transparent
                    title="Remove Collection"
                >
                    x
                </Button>
            </Row>
            <NonFieldError
                value={error?.[nonFieldError]}
            />
            <TextInput
                label="Title *"
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
            />
            <DateInput
                label="Date"
                name="date"
                value={value.date}
                onChange={onFieldChange}
                error={error?.date}
            />
        </>
    );
}

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
    const arrayError = getErrorObject(error?.collections);

    type Collections = typeof value.collections;

    const {
        setValue: onCollectionChange,
        removeValue: onCollectionRemove,
    } = useFormArray('collections', setFieldValue);

    const handleCollectionAdd = useCallback(
        () => {
            const clientId = randomString();
            const newCollection: PartialForm<CollectionType> = {
                clientId,
            };
            setFieldValue(
                (oldValue: PartialForm<Collections>) => (
                    [...(oldValue ?? []), newCollection]
                ),
                'collections',
            );
        },
        [setFieldValue],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <NonFieldError
                    value={error?.[nonFieldError]}
                />
                <TextInput
                    label="Name *"
                    name="name"
                    value={value.name}
                    onChange={setFieldValue}
                    error={error?.name}
                />
                <MetaInput
                    name="meta"
                    value={value.meta}
                    onChange={setFieldValue}
                    error={error?.meta}
                />
                <Row>
                    <h4>
                        Collections
                    </h4>
                    <Button
                        name={undefined}
                        onClick={handleCollectionAdd}
                        title="Add Collection"
                    >
                        +
                    </Button>
                </Row>
                <NonFieldError
                    value={arrayError?.[nonFieldError]}
                />
                {value.collections?.length ? (
                    value.collections.map((collection, index) => (
                        <CollectionInput
                            key={collection.clientId}
                            index={index}
                            value={collection}
                            onChange={onCollectionChange}
                            onRemove={onCollectionRemove}
                            error={arrayError?.[collection.clientId]}
                        />
                    ))
                ) : (
                    <div>No collections</div>
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
    title: 'Form/Nested Form',
};
