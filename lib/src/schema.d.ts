import {
    nonFieldError,
    fieldDependencies,
    nullValue,
    undefinedValue,
} from './types';

export type Schema<Value, TopValue = Value, Context = undefined> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArraySchema<Exclude<Value, undefined>[number], TopValue, Context>
            | LiteralSchema<Value, TopValue, Context>
        : (
            Exclude<Value, undefined> extends object
                ? ObjectSchema<Exclude<Value, undefined>, TopValue, Context>
                    | LiteralSchema<Value, TopValue, Context>
                : LiteralSchema<Value, TopValue, Context>
          )
);

export type LiteralSchema<Value, TopValue = Value, Context = undefined> = {
    // for accumulateValues and accumulateErrors
    required?: boolean,
    requiredValidation?: (value: Value, topValue: TopValue, context: Context) => string | undefined,

    // for accumulateValues
    forceValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue,
    defaultValue?: NonNullable<Value> | typeof undefinedValue | typeof nullValue,

    // for accumulateErrors
    validations?: (
        (value: Value, topValue: TopValue, context: Context) => string | undefined
    )[],
}

export type ArraySchema<Value, TopValue = Value, Context = undefined> = {
    validation?: (
        value: Value[] | undefined,
        topValue: TopValue,
        context: Context,
    ) => string | undefined;
    member: (
        value: Value,
        topValue: TopValue,
        context: Context,
    ) => Schema<Value, TopValue, Context>;
    keySelector: (value: Value) => string | number;
}

export type ObjectSchema<Value, TopValue = Value, Context = undefined> = {
    validation?: (
        value: Value | undefined,
        topValue: TopValue,
        context: Context,
    ) => string | undefined;
    fields: (
        value: Value | undefined,
        topValue: TopValue,
        context: Context,
    ) => (
        {
            [K in keyof Value]: Schema<Value[K], TopValue, Context>;
        } & {
            [fieldDependencies]?: { [K in keyof Value]: (keyof Value)[] };
        }
    );
}

export type Error<Value> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArrayError<Exclude<Value, undefined>[number]> | LeafError
        : (
            Exclude<Value, undefined> extends object
                ? ObjectError<Exclude<Value, undefined>> | LeafError
                : LeafError
        )
);

export type LeafError = string | undefined;

export type ArrayError<Value> = {
    [key: string]: Error<Value> | undefined;
} & { [nonFieldError]?: string };

export type ObjectError<Value> = {
    [K in keyof Value]?: Error<Value[K]> | undefined;
} & { [nonFieldError]?: string }

export function accumulateValues<Value, Context>(
    obj: Value,
    schema: Schema<Value, Value, Context>,
    topValue: Value | undefined,
    context: Context,
    settings?: { nullable: boolean },
): Value;

export function accumulateErrors<Value, Context>(
    obj: Value,
    schema: Schema<Value, Value, Context>,
    topValue: Value | undefined,
    context: Context,
): Error<Value> | undefined;

export function accumulateDifferentialErrors<Value, Context>(
    oldObj: Value,
    newObj: Value,
    oldError: Error<Value> | undefined,
    schema: Schema<Value, Value, Context>,
    topValue: Value | undefined,
    context: Context,
    force = false,
): Error<Value> | undefined;

export function analyzeErrors<Value>(
    errors: ArrayError<Value> | ObjectError<Value> | LeafError | null | undefined
): boolean;

export function addCondition<
    Value,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SchemaType extends { [K in keyof Value ]: Schema<Value[K], any, any> },
    DepKey extends NonNullable<Value>,
    ValKey extends NonNullable<Value>,
>(
    schema: SchemaType,
    value: Value,
    keys: readonly DepKey[],
    values: readonly ValKey[],
    updater: (
        val: Value extends null | undefined ? null | undefined : Pick<Value, DepKey>,
    ) => Pick<SchemaType, ValKey>,
): SchemaType;
