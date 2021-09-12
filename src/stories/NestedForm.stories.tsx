import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    DateInput,
} from '@togglecorp/toggle-ui';
import { randomString } from '@togglecorp/fujs';

import { createSubmitHandler } from '../submissionHelper';
import useForm, { useFormArray, useFormObject } from '../form';
import type { PartialForm as RawPartialForm, SetValueArg } from '../types';
import type { Error, ObjectSchema, ArraySchema } from '../schema';
import FormContainer, { Row } from './FormContainer';
import {
    requiredStringCondition,
    requiredCondition,
    greaterThanCondition,
} from '../validation';
import { getErrorObject } from '../errorAccessHelper';
import { internal } from '../types';

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
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type MetaType = NonNullable<FormType['meta']>;
type MetaSchema = ObjectSchema<PartialForm<MetaType>>;
type MetaSchemaFields = ReturnType<MetaSchema['fields']>;
type CollectionType = NonNullable<NonNullable<FormType['collections']>>[number];
type CollectionSchema = ObjectSchema<PartialForm<CollectionType>>;
type CollectionSchemaFields = ReturnType<CollectionSchema['fields']>;
type CollectionsSchema = ArraySchema<PartialForm<CollectionType>>;
type CollectionsSchemaMember = ReturnType<CollectionsSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: [requiredStringCondition],
        meta: ({
            fields: (): MetaSchemaFields => ({
                age: [requiredCondition, greaterThanCondition(12)],
                job: [],
            }),
        }),
        collections: {
            keySelector: (col) => col.clientId,
            member: (): CollectionsSchemaMember => ({
                fields: (): CollectionSchemaFields => ({
                    clientId: [],
                    date: [],
                    title: [requiredStringCondition],
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
            <p>
                {error?.[internal]}
            </p>
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
                <h4>
                    {`Collection #${index + 1}`}
                </h4>
                <Button
                    name={index}
                    onClick={onRemove}
                    transparent
                    title="Remove Collection"
                >
                    x
                </Button>
            </Row>
            <p>
                {error?.[internal]}
            </p>
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
            setValue(finalValues);
        }, [setValue],
    );

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
                'collections' as const,
            );
        },
        [setFieldValue],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                <p>
                    {error?.[internal]}
                </p>
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
                    <h3>
                        Collections
                    </h3>
                    <Button
                        name={undefined}
                        onClick={handleCollectionAdd}
                        title="Add Collection"
                    >
                        +
                    </Button>
                </Row>
                <p>
                    {arrayError?.[internal]}
                </p>
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
};

export default {
    title: 'Form/Nested Form',
};
