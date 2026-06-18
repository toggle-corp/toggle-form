import {
    accumulateErrors,
    accumulateConstraints,
} from './schema';
import type {
    ObjectSchema,
    ArraySchema,
} from './schema';
import { PartialForm } from './types';

interface MetaType {
    note: string;
}

interface FormType {
    name: string;
    bio: string;
    age: number;
    plain: string;
    tags: string[];
    meta: MetaType;
}

type FormValue = PartialForm<FormType>;
type FormSchema = ObjectSchema<FormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type MetaSchema = ObjectSchema<PartialForm<MetaType>, FormValue>;
type MetaSchemaFields = ReturnType<MetaSchema['fields']>;

type TagsSchema = ArraySchema<string, FormValue>;
type TagsSchemaMember = ReturnType<TagsSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: { maxLength: 5 },
        bio: { minLength: 3 },
        age: { min: 0, max: 120, integer: true },
        plain: {},
        // A constraint co-located with an array schema (member + keySelector).
        tags: {
            maxLength: 2,
            keySelector: (tag) => tag,
            member: (): TagsSchemaMember => ({}),
        },
        // A constraint co-located with an object schema (fields).
        meta: {
            maxLength: 1,
            fields: (): MetaSchemaFields => ({
                note: {},
            }),
        },
    }),
};

test('built-in length constraints on string fields', () => {
    expect(accumulateErrors({ name: 'abcdef' }, schema)).toEqual({
        name: 'Length must be no more than 5',
    });
    expect(accumulateErrors({ name: 'abcde' }, schema)).toEqual(undefined);

    expect(accumulateErrors({ bio: 'ab' }, schema)).toEqual({
        bio: 'Length must be at least 3',
    });
    expect(accumulateErrors({ bio: 'abc' }, schema)).toEqual(undefined);
});

test('built-in numeric and integer constraints', () => {
    expect(accumulateErrors({ age: -1 }, schema)).toEqual({
        age: 'The value must be at least 0',
    });
    expect(accumulateErrors({ age: 200 }, schema)).toEqual({
        age: 'The value must be no more than 120',
    });
    expect(accumulateErrors({ age: 3.5 }, schema)).toEqual({
        age: 'The field must be an integer',
    });
    expect(accumulateErrors({ age: 30 }, schema)).toEqual(undefined);
});

test('custom constraint messages (string and function)', () => {
    type Value = { n?: number };
    type Schema = ObjectSchema<Value>;
    type Fields = ReturnType<Schema['fields']>;

    const stringMessageSchema: Schema = {
        fields: (): Fields => ({
            n: { max: 10, messages: { max: 'too big' } },
        }),
    };
    const fnMessageSchema: Schema = {
        fields: (): Fields => ({
            n: { max: 10, messages: { max: (limit) => `must be <= ${limit}` } },
        }),
    };

    expect(accumulateErrors({ n: 11 }, stringMessageSchema)).toEqual({ n: 'too big' });
    expect(accumulateErrors({ n: 11 }, fnMessageSchema)).toEqual({ n: 'must be <= 10' });
});

test('NaN is treated as a present-but-invalid value (regression: fujs isDefined bypass)', () => {
    type Value = { n?: number | null };
    type Schema = ObjectSchema<Value>;
    type Fields = ReturnType<Schema['fields']>;

    const minSchema: Schema = { fields: (): Fields => ({ n: { min: 0 } }) };
    const maxSchema: Schema = { fields: (): Fields => ({ n: { max: 10 } }) };
    const intSchema: Schema = { fields: (): Fields => ({ n: { integer: true } }) };

    // NaN fails every numeric/integer constraint, matching the validation.ts factory validators.
    expect(accumulateErrors({ n: Number.NaN }, minSchema)).toEqual({
        n: 'The value must be at least 0',
    });
    expect(accumulateErrors({ n: Number.NaN }, maxSchema)).toEqual({
        n: 'The value must be no more than 10',
    });
    expect(accumulateErrors({ n: Number.NaN }, intSchema)).toEqual({
        n: 'The field must be an integer',
    });

    // null/undefined remain "absent" and are skipped, not flagged as invalid.
    expect(accumulateErrors({ n: undefined }, minSchema)).toEqual(undefined);
    expect(accumulateErrors({ n: null }, minSchema)).toEqual(undefined);
});

test('accumulateConstraints reports only enforced (literal-field) constraints', () => {
    // `plain` has no constraints (omitted); `tags` (array) and `meta` (object) carry a
    // maxLength that accumulateErrors never validates, so they must not be advertised either.
    expect(accumulateConstraints({}, schema)).toEqual({
        name: { maxLength: 5 },
        bio: { minLength: 3 },
        age: { min: 0, max: 120, integer: true },
    });
});

test('constraints on array/object schemas are neither enforced nor advertised', () => {
    // 4 tags exceed the co-located maxLength: 2, but it sits on an array schema, so no error.
    expect(accumulateErrors({ tags: ['a', 'b', 'c', 'd'] }, schema)).toEqual(undefined);

    const constraints = accumulateConstraints({ tags: ['a', 'b', 'c', 'd'] }, schema);
    expect(constraints.tags).toEqual(undefined);
    expect(constraints.meta).toEqual(undefined);
});
