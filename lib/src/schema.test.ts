import {
    accumulateValues,
    accumulateErrors,
    analyzeErrors,
    accumulateDifferentialErrors,
    addCondition,
} from './schema';
import type { ObjectSchema } from './schema';
import {
    PartialForm,
    nonFieldError,
    nullValue,
    undefinedValue,
} from './types';
import {
    requiredStringCondition,
    greaterThanOrEqualToCondition,
    lengthGreaterThanCondition,
} from './validation';

interface CountryDistrict {
    clientId: string;
    country: number;
    district: number;
    streets: string[];
    locations: string[];
    clientInfo: {
        userName: string,
        userAddress: string,
        userLocations: string[],
        citizenCode: {
            roll: number,
        },
    },
}

interface FormType {
    name: string;
    email: string;
    familyName: string;
    address: string;
    password: string;
    confirmPassword: string;
    permanentAddress: string;
    age: number
    countryDistrict: CountryDistrict[];
    startDate: number;
    endDate: number;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const errorFormTypeSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        const fields: FormSchemaFields = {
            name: {
                validations: [lengthGreaterThanCondition(5)],
            },
            email: {},
            familyName: {
                required: true,
                requiredValidation: requiredStringCondition,
                forceValue: nullValue,
                validations: [],
            },
            password: {},
            confirmPassword: {},
            address: {},
            startDate: {},
            countryDistrict: {
                keySelector: (c) => c.clientId as string,
                member: () => ({
                    fields: () => ({
                        clientId: {
                            forceValue: undefinedValue,
                        },
                        country: {
                            forceValue: nullValue,
                        },
                        district: {},
                        streets: {
                            forceValue: [],
                        },
                        locations: {},
                        clientInfo: {
                            fields: () => ({
                                userName: {},
                                userAddress: {
                                    defaultValue: undefinedValue,
                                },
                                userLocations: {
                                    defaultValue: [],
                                },
                                citizenCode: {
                                    fields: () => ({
                                        roll: {
                                            required: true,
                                        },
                                    }),
                                },
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
                    validations: [greaterThanOrEqualToCondition(v.startDate)],
                },
            } : {
                endDate: {},
            }),
        );
    },
    validation: (value) => {
        if (value?.password !== value?.confirmPassword) {
            return 'The passwords do not match.';
        }
        return undefined;
    },
};

test('Test accumulateValues', () => {
    expect(
        accumulateValues(
            {},
            { fields: () => ({}) },
            {},
            null,
            { nullable: false },
        ),
    ).toBe(undefined);

    const data: PartialForm<FormType> = {
        name: 'Priyesh',
        familyName: '',
        email: 'priyesh@togglecorp.com',
        address: 'Kalanki',
        countryDistrict: [
            {
                clientId: '301A',
                country: 16,
                district: 100,
                streets: [
                    'house 1',
                    'house 2',
                ],
                locations: [
                    'locate 1',
                    'locate 2',
                ],
                clientInfo: {
                    userName: 'Jimmy',
                    userAddress: 'New Road',
                    userLocations: [
                        'Teku',
                        'Pako New-road',
                    ],
                    citizenCode: {},
                },
            },
            {
                clientId: undefined,
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {},
                },
            },
            {
                clientId: '311Q',
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {},
                },
            },
        ],
    };
    expect(
        accumulateValues(
            data,
            errorFormTypeSchema,
            data,
            undefined,
            { nullable: false },
        ),
    ).toStrictEqual({
        name: 'Priyesh',
        familyName: null,
        email: 'priyesh@togglecorp.com',
        address: 'Kalanki',
        countryDistrict: [
            {
                country: null,
                district: 100,
                streets: [],
                locations: [
                    'locate 1',
                    'locate 2',
                ],
                clientInfo: {
                    userName: 'Jimmy',
                    userAddress: 'New Road',
                    userLocations: [
                        'Teku',
                        'Pako New-road',
                    ],
                },
            },
            {
                country: null,
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                },
            },
            {
                country: null,
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                },
            },
        ],
    });
});

test('Test accumulateErrors', () => {
    expect(
        accumulateErrors(
            {},
            { fields: () => ({}) },
            {},
            undefined,
        ),
    ).toBe(undefined);

    const errorCheckData: PartialForm<FormType> = {
        name: 'Pri',
        familyName: '',
        password: 'admin123',
        confirmPassword: '123',
        email: 'priyesh@togglecorp.com',
        address: 'Kalanki',
        countryDistrict: [
            {
                clientId: '301A',
                country: 16,
                district: 100,
                streets: [
                    'house 1',
                    'house 2',
                ],
                locations: [
                    'locate 1',
                    'locate 2',
                ],
                clientInfo: {
                    userName: 'Jimmy',
                    userAddress: 'New Road',
                    userLocations: [
                        'Teku',
                        'Pako New-road',
                    ],
                    citizenCode: {
                        roll: 1223,
                    },
                },
            },
            {
                clientId: undefined,
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {
                        roll: 2234,
                    },
                },
            },
            {
                clientId: '311Q',
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {},
                },
            },
        ],
    };
    expect(
        accumulateErrors(
            errorCheckData,
            errorFormTypeSchema,
            errorCheckData,
            undefined,
        ),
    ).toStrictEqual({
        name: 'Length must be greater than 5',
        familyName: 'The field is required',
        [nonFieldError]: 'The passwords do not match.',
        countryDistrict: {
            '311Q': {
                clientInfo: {
                    citizenCode: {
                        roll: 'The field is required',
                    },
                },
            },
        },
    });
});

test('Test accumulateDifferentialErrors', () => {
    expect(
        accumulateDifferentialErrors(
            {},
            {},
            {},
            { fields: () => ({}) },
            {},
            undefined,
            false,
        ),
    ).toBe(undefined);

    const oldData: PartialForm<FormType> = {
        name: 'Jonathan',
        familyName: 'Hopkins',
        password: 'admin123',
        confirmPassword: 'admin123',
        email: 'priyesh@togglecorp.com',
        address: 'Kalanki',
        startDate: 100,
        endDate: 100,
        countryDistrict: [
            {
                clientId: '301A',
                country: 16,
                district: 100,
                streets: [
                    'house 1',
                    'house 2',
                ],
                locations: [
                    'locate 1',
                    'locate 2',
                ],
                clientInfo: {
                    userName: 'Jimmy',
                    userAddress: 'New Road',
                    userLocations: [
                        'Teku',
                        'Pako New-road',
                    ],
                    citizenCode: {
                        roll: 1223,
                    },
                },
            },
            {
                clientId: undefined,
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {
                        roll: 1223,
                    },
                },
            },
            {
                clientId: '311Q',
                district: 100,
                streets: [],
                locations: [],
                clientInfo: {
                    userName: '',
                    userLocations: [],
                    citizenCode: {
                        roll: 1223,
                    },
                },
            },
        ],
    };

    const oldErrors = accumulateErrors(
        oldData,
        errorFormTypeSchema,
        oldData,
        undefined,
    );

    const newData: PartialForm<FormType> = {
        ...oldData,
        name: 'Jim',
        familyName: '',
        endDate: 99,
    };

    const newErrors = accumulateDifferentialErrors(
        oldData,
        newData,
        oldErrors,
        errorFormTypeSchema,
        newData,
        undefined,
        false,
    );

    expect(newErrors).toStrictEqual({
        name: 'Length must be greater than 5',
        endDate: 'The field must be greater than or equal to 100',
        familyName: 'The field is required',
    });

    const newerData: PartialForm<FormType> = {
        ...newData,
        name: 'Jonathan',
    };

    const newerErrors = accumulateDifferentialErrors(
        newData,
        newerData,
        newErrors,
        errorFormTypeSchema,
        newerData,
        undefined,
        false,
    );

    expect(newerErrors).toStrictEqual({
        endDate: 'The field must be greater than or equal to 100',
        familyName: 'The field is required',
    });
});

test('Test analyzeErrors', () => {
    expect(analyzeErrors(null)).toBe(false);
    expect(analyzeErrors('This is required')).toBe(true);
    expect(analyzeErrors({})).toBe(false);
    expect(analyzeErrors({ [nonFieldError]: 'This is required' })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
        fieldTwo: 'There is an error',
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {},
    })).toBe(false);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {
            [nonFieldError]: 'This is required',
        },
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
    })).toBe(false);
});
