import React, { useCallback } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    DateInput,
} from '@togglecorp/toggle-ui';
import { randomString } from '@togglecorp/fujs';

import useForm, { createSubmitHandler, useFormArray, useFormObject } from '../form';
import type { PartialForm } from '../types';
import type { Error, ObjectSchema, ArraySchema } from '../schema';
import FormContainer, { Row } from './FormContainer';
import {
    requiredStringCondition,
    requiredCondition,
    greaterThanCondition,
} from '../validation';

type FormType = {
    name?: string;
    meta?: {
        age?: number;
        job?: string;
    };
    collections?: {
        uuid: string;
        date?: string;
        title?: string;
    }[];
};
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type MetaType = NonNullable<FormType['meta']>;
type MetaSchema = ObjectSchema<PartialForm<MetaType>>;
type MetaSchemaFields = ReturnType<MetaSchema['fields']>;
const metaSchema: MetaSchema = {
    fields: (): MetaSchemaFields => ({
        age: [requiredCondition, greaterThanCondition(12)],
        job: [],
    }),
};

type CollectionType = NonNullable<NonNullable<FormType['collections']>>[number];

type CollectionSchema = ObjectSchema<PartialForm<CollectionType>>;
type CollectionSchemaFields = ReturnType<CollectionSchema['fields']>;
const collectionSchema: CollectionSchema = {
    fields: (): CollectionSchemaFields => ({
        uuid: [],
        date: [],
        title: [requiredStringCondition],
    }),
};

type CollectionsSchema = ArraySchema<PartialForm<CollectionType>>;
type CollectionsSchemaMember = ReturnType<CollectionsSchema['member']>;
const collectionsSchema: CollectionsSchema = {
    keySelector: (col) => col.uuid,
    member: (): CollectionsSchemaMember => collectionSchema,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: [requiredStringCondition],
        meta: metaSchema,
        collections: collectionsSchema,
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

interface MetaInputProps<K extends string> {
   name: K,
   value: PartialForm<MetaType> | undefined,
   error: Error<MetaType> | undefined;
   onChange: (value: PartialForm<MetaType>, name: K) => void;
}
const defaultMetaValue: PartialForm<MetaType> = {};
function MetaInput<K extends string>(props: MetaInputProps<K>) {
    const {
        name,
        value = defaultMetaValue,
        error,
        onChange,
    } = props;

    const onFieldChange = useFormObject(name, value, onChange);

    return (
        <>
            <p>
                {error?.$internal}
            </p>
            <NumberInput
                label="Age *"
                name="age"
                value={value.age}
                onChange={onFieldChange}
                error={error?.fields?.age}
            />
            <TextInput
                label="Job"
                name="job"
                value={value.job}
                onChange={onFieldChange}
                error={error?.fields?.job}
            />
        </>
    );
}

interface CollectionInputProps {
   value: PartialForm<CollectionType>,
   error: Error<CollectionType> | undefined;
   onChange: (value: PartialForm<CollectionType>, index: number) => void;
   onRemove: (index: number) => void;
   index: number,
}
function CollectionInput(props: CollectionInputProps) {
    const {
        value,
        error,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, value, onChange);

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
                {error?.$internal}
            </p>
            <TextInput
                label="Title *"
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.fields?.title}
            />
            <DateInput
                label="Date"
                name="date"
                value={value.date}
                onChange={onFieldChange}
                error={error?.fields?.date}
            />
        </>
    );
}

export const Default = () => {
    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(defaultFormValues, schema);

    const handleSubmit = useCallback(
        (finalValues: PartialForm<FormType>) => {
            onValueSet(finalValues);
        }, [onValueSet],
    );

    const {
        onValueChange: onCollectionChange,
        onValueRemove: onCollectionRemove,
    } = useFormArray('collections', value.collections ?? [], onValueChange);

    const handleCollectionAdd = useCallback(
        () => {
            const uuid = randomString();
            const newCollection: PartialForm<CollectionType> = {
                uuid,
            };
            onValueChange(
                [...(value.collections ?? []), newCollection],
                'collections' as const,
            );
        },
        [onValueChange, value.collections],
    );

    return (
        <FormContainer value={value}>
            <form
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.$internal}
                </p>
                <TextInput
                    label="Name *"
                    name="name"
                    value={value.name}
                    onChange={onValueChange}
                    error={error?.fields?.name}
                />
                <MetaInput
                    name="meta"
                    value={value.meta}
                    onChange={onValueChange}
                    error={error?.fields?.meta}
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
                    {error?.fields?.collections?.$internal}
                </p>
                {value.collections?.length ? (
                    value.collections.map((collection, index) => (
                        <CollectionInput
                            key={collection.uuid}
                            index={index}
                            value={collection}
                            onChange={onCollectionChange}
                            onRemove={onCollectionRemove}
                            error={error?.fields?.collections?.members?.[collection.uuid]}
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
