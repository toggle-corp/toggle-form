import {
    addCondition,
    accumulateDifferentialErrors,
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
    clientInfoId: string,
    location: string;
}

interface Client {
    clientId: string;
    name: string;
    // nested object
    meta: ClientInfoMeta,
    connection: Connection,
    strength: number;
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
        let fields: FormSchemaFields = {
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
        };
        fields = addCondition(
            fields,
            value,
            ['startDate'],
            ['endDate'],
            (v) => (v?.startDate ? {
                endDate: {
                    required: true,
                    validations: [greaterThanOrEqualToCondition(v.startDate)],
                },
            } : {
                endDate: {
                    forceValue: nullValue,
                },
            }),
        );
        fields = addCondition(
            fields,
            value,
            ['name'],
            ['clients'],
            (v) => {
                const clientsSchema: FormSchemaFields['clients'] = {
                    validation: (clients) => {
                        if (clients && clients.length > 2) {
                            return 'Clients cannot be more than 2';
                        }
                        return undefined;
                    },
                    keySelector: (c) => c.clientId as string,
                    member: () => ({
                        fields: (clientValue): ClientSchemaFields => {
                            const clientFields: ClientSchemaFields = {
                                clientId: {},
                                meta: {
                                    fields: (): ClientInfoSchemaFields => ({
                                        clientInfoId: {},
                                        location: {},
                                    }),
                                },
                                connection: {
                                    fields: (): ConnectionSchemaFields => ({
                                        name: { defaultValue: undefinedValue },
                                    }),
                                },
                            };
                            return addCondition(
                                clientFields,
                                clientValue,
                                [],
                                ['name', 'strength'],
                                () => (v?.name === 'Admin' ? {
                                    name: {},
                                    strength: {},
                                } : {
                                    name: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                    strength: {
                                        validations: [greaterThanOrEqualToCondition(0)],
                                    },
                                }),
                            );
                        },
                    }),
                };
                return {
                    clients: clientsSchema,
                };
            },
        );

        return fields;
    },
};

test('accumulate differential errors to fail required field', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        name: undefined,
    };
    const oldError = {};
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'The field is required',
    });
});

test('accumulate differential errors to pass required field', () => {
    const oldValue: PartialForm<FormType> = {
        name: undefined,
        email: 'hari.bahadur@gmail.com',
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        name: 'Hari Bahadur',
    };
    const oldError = {
        name: 'The field is required',
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual(undefined);
});

test('accumulate differential errors to fail required field on array', () => {
    const oldValue: PartialForm<FormType> = {
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
        ],
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        clients: oldValue.clients ? [
            oldValue.clients[0],
            {
                ...oldValue.clients[1],
                name: undefined,
            },
        ] : [],
    };
    const oldError = {};
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            2: {
                name: 'The field is required',
            },
        },
    });
});

test('accumulate differential errors to pass required field on array', () => {
    const oldValue: PartialForm<FormType> = {
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
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        clients: oldValue.clients ? [
            oldValue.clients[0],
            {
                ...oldValue.clients[1],
                name: 'Sita',
            },
        ] : [],
    };
    const oldError = {
        clients: {
            1: {
                name: 'The field is required',
            },
            2: {
                name: 'The field is required',
            },
        },
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            1: {
                name: 'The field is required',
            },
        },
    });
});

test('accumulate differential errors to fail object validation', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 9,
        endDate: 10,
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        startDate: 10,
        endDate: 9,
    };
    const oldError = {
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        [nonFieldError]: 'Start date should be before end date',
        endDate: 'The field must be greater than or equal to 10',
    });
});

test('accumulate differential errors to pass object validation', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 10,
        endDate: 9,
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        startDate: 9,
        endDate: 10,
    };
    const oldError = {
        [nonFieldError]: 'Start date should be before end date',
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual(undefined);
});

test('accumulate differential errors to fail array validation', () => {
    const oldValue: PartialForm<FormType> = {
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
        ],
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        clients: [
            ...(oldValue.clients ?? []),
            {
                clientId: '3',
                name: 'Rita',
            },
        ],
    };
    const oldError = {
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            [nonFieldError]: 'Clients cannot be more than 2',
        },
    });
});

test('accumulate differential errors to fail array validation pt.2', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
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
    const oldError = {
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            [nonFieldError]: 'Clients cannot be more than 2',
        },
    });
});

test('accumulate differential errors to pass array validation', () => {
    const oldValue: PartialForm<FormType> = {
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
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        clients: (oldValue.clients ?? []).slice(2),
    };
    const oldError = {
        clients: {
            [nonFieldError]: 'Clients cannot be more than 2',
        },
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toBe(undefined);
});

test('accumulate differential errors to pass array validation pt.2', () => {
    const oldValue: PartialForm<FormType> = {
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
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        clients: undefined,
    };
    const oldError = {
        clients: {
            [nonFieldError]: 'Clients cannot be more than 2',
        },
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toBe(undefined);
});

test('accumulate differential errors with conditional', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 9,
        endDate: 10,
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        startDate: 9,
        endDate: 8,
    };
    const oldError = {};
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        [nonFieldError]: 'Start date should be before end date',
        endDate: 'The field must be greater than or equal to 9',
    });
});

test('accumulate differential errors with previous error', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 10,
        endDate: 10,
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        name: undefined,
    };
    const oldError = {
        [nonFieldError]: 'The error that will be cleared on change',
        startDate: 'The date has some issue',
        endDate: 'The date has some issue',
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'The field is required',
        startDate: 'The date has some issue',
        endDate: 'The date has some issue',
    });
});

test('accumulate differential errors with conditional and previous error', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Hari Bahadur',
        email: 'hari.bahadur@gmail.com',
        startDate: 9,
        endDate: 8,
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        name: undefined,
    };
    const oldError = {
        [nonFieldError]: 'Start date should be before end date',
        endDate: 'The field must be greater than or equal to 9',
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        name: 'The field is required',
        [nonFieldError]: 'Start date should be before end date',
        endDate: 'The field must be greater than or equal to 9',
    });
});

test('accumulate differential errors with nested conditional', () => {
    const oldValue: PartialForm<FormType> = {
        name: 'Admin',
        email: 'hari.bahadur@gmail.com',
        clients: [
            {
                clientId: '1',
                strength: -10,
            },
            {
                clientId: '2',
                strength: -10,
            },
        ],
    };
    const newValue: PartialForm<FormType> = {
        ...oldValue,
        name: 'Hari Bahadur',
    };
    const oldError = {
    };
    expect(accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        errorFormTypeSchema,
        undefined,
        undefined,
    )).toStrictEqual({
        clients: {
            1: {
                strength: 'The field must be greater than or equal to 0',
            },
            2: {
                strength: 'The field must be greater than or equal to 0',
            },
        },
    });
});
