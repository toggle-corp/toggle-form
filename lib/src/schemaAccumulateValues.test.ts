import {
    addCondition,
    accumulateValues,
} from './schema';
import type { ObjectSchema } from './schema';
import {
    PartialForm,
    nullValue,
    undefinedValue,
} from './types';
import {
    requiredStringCondition,
    greaterThanOrEqualToCondition,
} from './validation';

interface Connection {
    name: string;
}

interface ClientInfoMeta {
    userName: string,
    location: string;
}

interface Client {
    clientId: string;
    name: string;
    // nested object
    meta: ClientInfoMeta,
    connection: Connection,
}

interface FormType {
    name: string;
    nicknames: string[];
    email: string;
    address: string;
    age: number

    startDate: number;
    endDate?: number;

    clients: Client[];
}

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ClientSchema = ObjectSchema<PartialForm<Client>>;
type ClientSchemaFields = ReturnType<ClientSchema['fields']>;

type ClientInfoSchema = ObjectSchema<PartialForm<ClientInfoMeta>>;
type ClientInfoSchemaFields = ReturnType<ClientInfoSchema['fields']>;

type ConnectionSchema = ObjectSchema<PartialForm<Connection>>;
type ConnectionSchemaFields = ReturnType<ConnectionSchema['fields']>;

const errorFormTypeSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        const fields: FormSchemaFields = {
            // validation
            name: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            email: { forceValue: undefinedValue },
            nicknames: { defaultValue: nullValue },
            address: { defaultValue: 'Earth' },
            age: { forceValue: 25 },
            startDate: {
                validations: [greaterThanOrEqualToCondition(0)],
            },

            clients: {
                // validation
                keySelector: (c) => c.clientId as string,
                member: () => ({
                    fields: (): ClientSchemaFields => ({
                        // validation
                        clientId: {},
                        name: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                        meta: {
                            fields: (): ClientInfoSchemaFields => ({
                                userName: {},
                                location: {},
                            }),
                        },
                        connection: {
                            fields: (): ConnectionSchemaFields => ({
                                name: { defaultValue: undefinedValue },
                            }),
                        },
                    }),
                }),
            },
        };
        return addCondition(
            fields,
            value,
            ['startDate'] as const,
            ['endDate'] as const,
            (v) => (v?.startDate ? {
                endDate: {
                    required: true,
                    validations: [greaterThanOrEqualToCondition(0)],
                },
            } : {
                endDate: {
                    forceValue: nullValue,
                },
            }),
        );
    },
};

test('accumulate values with null values', () => {
    const value: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 120001011,
    };
    expect(accumulateValues(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
        { nullable: true },
    )).toStrictEqual({
        name: 'Hari Bahadur',
        nicknames: null,
        address: 'Earth',
        age: 25,
        startDate: 120001011,
        endDate: null,
        clients: [],
    });
});

test('accumulate values without null values', () => {
    const value: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        endDate: 14243243243242,
    };
    expect(accumulateValues(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
        { nullable: false },
    )).toStrictEqual({
        name: 'Hari Bahadur',
        address: 'Earth',
        nicknames: null,
        age: 25,
        endDate: null,
        clients: [],
    });
    expect(accumulateValues(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'Hari Bahadur',
        address: 'Earth',
        nicknames: null,
        age: 25,
        endDate: null,
        clients: [],
    });
});

test('accumulate values with conditional', () => {
    const valueWithoutStartDate: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        endDate: 14243243243242,
    };
    expect(accumulateValues(
        valueWithoutStartDate,
        errorFormTypeSchema,
        undefined,
        undefined,
        { nullable: true },
    )).toStrictEqual({
        name: 'Hari Bahadur',
        startDate: null,
        nicknames: null,
        endDate: null,
        address: 'Earth',
        age: 25,
        clients: [],
    });

    const valueWithStartDate: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 14243243243242,
        endDate: 14243243243242,
    };
    expect(accumulateValues(
        valueWithStartDate,
        errorFormTypeSchema,
        undefined,
        undefined,
        { nullable: true },
    )).toStrictEqual({
        name: 'Hari Bahadur',
        nicknames: null,
        startDate: 14243243243242,
        endDate: 14243243243242,
        address: 'Earth',
        age: 25,
        clients: [],
    });
});

test('accumulate values with nested values', () => {
    const value: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        clients: [
            {
                clientId: '1',
                meta: {
                    userName: 'client-1',
                },
                connection: {
                    name: '1-1',
                },
            },
            {
                clientId: '2',
                meta: {},
            },
            {
                clientId: '3',
                meta: {},
                connection: {
                },
            },
        ],
    };

    expect(accumulateValues(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
        { nullable: true },
    )).toStrictEqual({
        name: 'Hari Bahadur',
        nicknames: null,
        address: 'Earth',
        age: 25,
        startDate: null,
        endDate: null,
        clients: [
            {
                clientId: '1',
                name: null,
                meta: {
                    userName: 'client-1',
                    location: null,
                },
                connection: {
                    name: '1-1',
                },
            },
            {
                clientId: '2',
                name: null,
                meta: {
                    userName: null,
                    location: null,
                },
                connection: null,
            },
            {
                clientId: '3',
                name: null,
                meta: {
                    userName: null,
                    location: null,
                },
                connection: null,
            },
        ],
    });
    expect(accumulateValues(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'Hari Bahadur',
        address: 'Earth',
        age: 25,
        nicknames: null,
        endDate: null,
        clients: [
            {
                clientId: '1',
                meta: {
                    userName: 'client-1',
                },
                connection: {
                    name: '1-1',
                },
            },
            {
                clientId: '2',
            },
            {
                clientId: '3',
            },
        ],
    });
});
