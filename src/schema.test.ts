import {
    accumulateValues,
    accumulateErrors,
    analyzeErrors,
    accumulateDifferentialErrors,
} from './schema';
import type { ObjectSchema } from './schema';
import {
    PartialForm,
    internal,
} from './types';
import {
    defaultEmptyArrayType,
    defaultUndefinedType,
    forceEmptyArrayType,
    forceNullType,
    forceUndefinedType,
    requiredCondition,
    requiredStringCondition,
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

test('Test accumulateValues', () => {
    const formTypeSchema: FormSchema = {
        fields: (): FormSchemaFields => ({
            name: [],
            email: [],
            familyName: [requiredCondition],
            address: [],
            countryDistrict: {
                keySelector: (c) => c.clientId as string,
                member: () => ({
                    fields: () => ({
                        clientId: [forceUndefinedType],
                        country: [forceNullType],
                        district: [],
                        streets: [forceEmptyArrayType],
                        locations: [],
                        clientInfo: {
                            fields: () => ({
                                userName: [],
                                userAddress: [defaultUndefinedType],
                                userLocations: [defaultEmptyArrayType],
                                citizenCode: {
                                    fields: () => ({
                                        roll: [],
                                    }),
                                },
                            }),
                        },
                    }),
                }),
            },
        }),
    };

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
                country: null,
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
                country: null,
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
            {},
            { fields: () => ({}) },
            { nullable: false },
            {},
            null,
        ),
    ).toBe(undefined);
    expect(
        accumulateValues(
            data,
            formTypeSchema,
            { nullable: false },
            data,
            null,
        ),
    ).toStrictEqual({
        name: 'Priyesh',
        familyName: '',
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

const errorFormTypeSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: [(name) => {
            if (name && name.length < 5) {
                return 'length of name must be greater than 5';
            }
            return undefined;
        }],
        email: [],
        familyName: [requiredStringCondition],
        password: [],
        confirmPassword: [],
        address: [],
        startDate: [],
        endDate: [(currentEndDate, allValue) => {
            if (allValue.startDate >= currentEndDate) {
                return 'End date should be greater than start date';
            }

            return undefined;
        }],
        countryDistrict: {
            keySelector: (c) => c.clientId as string,
            member: () => ({
                fields: () => ({
                    clientId: [forceUndefinedType],
                    country: [forceNullType],
                    district: [],
                    streets: [forceEmptyArrayType],
                    locations: [],
                    clientInfo: {
                        fields: () => ({
                            userName: [],
                            userAddress: [defaultUndefinedType],
                            userLocations: [defaultEmptyArrayType],
                            citizenCode: {
                                fields: () => ({
                                    roll: [requiredCondition],
                                }),
                            },
                        }),
                    },
                }),
            }),
        },
    }),
    fieldDependencies: () => ({
        endDate: ['startDate'],
    }),
    validation: (value) => {
        if (value?.password !== value?.confirmPassword) {
            return 'The passwords do not match.';
        }
        return undefined;
    },
};

test('Test accumulateErrors', () => {
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
                country: null,
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
                country: null,
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
            {},
            { fields: () => ({}) },
            {},
            undefined,
        ),
    ).toBe(undefined);
    expect(
        accumulateErrors(
            errorCheckData,
            errorFormTypeSchema,
            errorCheckData,
            null,
        ),
    ).toStrictEqual({
        name: 'length of name must be greater than 5',
        familyName: 'The field is required',
        [internal]: 'The passwords do not match.',
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
    const oldDifferentialData: PartialForm<FormType> = {
        name: 'Jimmy',
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
                country: null,
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
                country: null,
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

    const similarDifferentialData: PartialForm<FormType> = {
        name: 'Jim',
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
                country: null,
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
                country: null,
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

    const newDifferentialData: PartialForm<FormType> = {
        name: 'Joe',
        familyName: '',
        password: 'admin123',
        confirmPassword: 'admin123',
        email: 'priyesh@togglecorp.com',
        address: 'Kalanki',
        startDate: 100,
        endDate: 110,
        permanentAddress: 'Pokhara',
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
                country: null,
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
                country: null,
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
        oldDifferentialData,
        errorFormTypeSchema,
        oldDifferentialData,
        undefined,
    );

    const diffError = accumulateDifferentialErrors(
        oldDifferentialData,
        newDifferentialData,
        oldErrors,
        errorFormTypeSchema,
        newDifferentialData,
        true,
        undefined,
    );

    const newError = accumulateErrors(
        newDifferentialData,
        errorFormTypeSchema,
        newDifferentialData,
        undefined,
    );

    expect(
        accumulateDifferentialErrors(
            {},
            {},
            {},
            { fields: () => ({}) },
            {},
            false,
            undefined,
        ),
    ).toBe(undefined);
    expect(
        accumulateDifferentialErrors(
            oldDifferentialData,
            similarDifferentialData,
            oldErrors,
            errorFormTypeSchema,
            similarDifferentialData,
            true,
            undefined,
        ),
    ).toStrictEqual({
        name: 'length of name must be greater than 5',
        endDate: 'End date should be greater than start date',
    });
    expect(
        accumulateDifferentialErrors(
            oldDifferentialData,
            newDifferentialData,
            oldErrors,
            errorFormTypeSchema,
            newDifferentialData,
            false,
            undefined,
        ),
    ).toStrictEqual({
        name: 'length of name must be greater than 5',
        familyName: 'The field is required',
    });
    expect(diffError).toStrictEqual({
        name: 'length of name must be greater than 5',
        familyName: 'The field is required',
    });
    expect(newError).toStrictEqual({
        name: 'length of name must be greater than 5',
        familyName: 'The field is required',
    });
});

test('Test analyzeErrors', () => {
    expect(analyzeErrors(null)).toBe(false);
    expect(analyzeErrors('This is required')).toBe(true);
    expect(analyzeErrors({})).toBe(false);
    expect(analyzeErrors({ [internal]: 'This is required' })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
        fieldTwo: 'There is an error',
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: 'There is an error',
        fieldTwo: null,
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {},
    })).toBe(false);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: {
            [internal]: 'This is required',
        },
    })).toBe(true);
    expect(analyzeErrors({
        fieldOne: undefined,
        fieldTwo: null,
    })).toBe(false);
});
