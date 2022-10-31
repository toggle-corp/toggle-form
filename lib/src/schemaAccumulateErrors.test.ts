import {
    addCondition,
    accumulateErrors,
} from './schema';
import type { ObjectSchema } from './schema';
import {
    PartialForm,
    nullValue,
    undefinedValue,
    nonFieldError,
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
    validation: (value) => {
        if (value && value.startDate && value.endDate && value.startDate > value.endDate) {
            return 'Start date should be before end date';
        }
        return undefined;
    },
    fields: (value): FormSchemaFields => {
        const fields: FormSchemaFields = {
            name: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            email: { forceValue: undefinedValue },
            nicknames: { defaultValue: nullValue },
            address: { defaultValue: 'Earth' },
            age: {
                forceValue: 25,
                validations: [greaterThanOrEqualToCondition(0)],
            },
            startDate: {},

            clients: {
                validation: (clients) => {
                    if (clients && clients.length > 2) {
                        return 'Clients cannot be more than 2';
                    }
                    return undefined;
                },
                keySelector: (c) => c.clientId as string,
                member: () => ({
                    fields: (): ClientSchemaFields => ({
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

test('accumulate errors with required condition', () => {
    const valueWithoutName: PartialForm<FormType> = {
        email: 'hari.bahadur@gmail.com',
    };
    expect(accumulateErrors(
        valueWithoutName,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'The field is required',
    });
});

test('accumulate errors with literal condition', () => {
    const valueWithoutName: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        age: -10,
    };
    expect(accumulateErrors(
        valueWithoutName,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        age: 'The field must be greater than or equal to 0',
    });
});

test('accumulate errors with object validation', () => {
    const valueWithoutName: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 10,
        endDate: 9,
    };
    expect(accumulateErrors(
        valueWithoutName,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        [nonFieldError]: 'Start date should be before end date',
    });
});

test('accumulate errors with array validation', () => {
    const valueWithoutName: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        clients: [
            {
                clientId: '1',
                name: 'Gita',
            },
            {
                clientId: '2',
                name: 'Sita',
            },
            {
                clientId: '3',
                name: 'Rita',
            },
        ],
    };
    expect(accumulateErrors(
        valueWithoutName,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            [nonFieldError]: 'Clients cannot be more than 2',
        },
    });
});

test('accumulate errors with nested validation', () => {
    const valueWithoutName: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        clients: [
            {
                clientId: '1',
            },
            {
                clientId: '2',
            },
        ],
    };
    expect(accumulateErrors(
        valueWithoutName,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            1: {
                name: 'The field is required',
            },
            2: {
                name: 'The field is required',
            },
        },
    });
});

test('accumulate errors with conditional', () => {
    const value: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 120001011,
    };
    expect(accumulateErrors(
        value,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        endDate: 'The field is required',
    });
});
