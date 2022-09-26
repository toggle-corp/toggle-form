import { internal, dependencies } from './types';

export type Schema<Value, TopValue = Value, Context = undefined> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArraySchema<Exclude<Value, undefined>[number], TopValue, Context>
            | LiteralSchema<Value, TopValue, Context>
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<Value, undefined> extends object
                ? ObjectSchema<Exclude<Value, undefined>, TopValue, Context>
                    | LiteralSchema<Value, TopValue, Context>
                : LiteralSchema<Value, TopValue, Context>
          )
);

export type LiteralSchema<Value, TopValue = Value, Context = undefined> = (
    (value: Value, baseValue: TopValue, context: Context) => string | undefined
)[];

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
            [dependencies]?: { [K in keyof Value]: (keyof Value)[] };
        }
    );
}

export type Error<Value> = (
    Exclude<Value, undefined> extends unknown[]
        ? ArrayError<Exclude<Value, undefined>[number]> | LeafError
        : (
            // eslint-disable-next-line @typescript-eslint/ban-types
            Exclude<Value, undefined> extends object
                ? ObjectError<Exclude<Value, undefined>> | LeafError
                : LeafError
        )
);

export type LeafError = string | undefined;

export type ArrayError<Value> = {
    [key: string]: Error<Value> | undefined;
} & { [internal]?: string };

export type ObjectError<Value> = {
    [K in keyof Value]?: Error<Value[K]> | undefined;
} & { [internal]?: string }

export function accumulateValues<Value, Context>(
    obj: Value,
    schema: Schema<Value, Value, Context>,
    settings?: { nullable: boolean },
    baseValue: Value,
    context: Context,
): Value;

export function accumulateErrors<Value, Context>(
    obj: Value,
    schema: Schema<Value, Value, Context>,
    baseValue: Value,
    context: Context,
): Error<Value> | undefined;

export function accumulateDifferentialErrors<Value, Context>(
    oldObj: Value,
    newObj: Value,
    oldError: Error<Value> | undefined,
    schema: Schema<Value, Value, Context>,
    baseValue: Value,
    // FIXME: move this below context
    force = false,
    context: Context,
): Error<Value> | undefined;

export function analyzeErrors<Value>(
    errors: ArrayError<Value> | ObjectError<Value> | LeafError
): boolean;

export function addCondition<
    Value,
    Sk extends { [K in keyof Value ]: Schema<Value[K], any, any> },
    DepKey extends NonNullable<Value>,
    ValKey extends NonNullable<Value>,
>(
    schema: Sk,
    value: Value,
    keys: readonly DepKey[],
    values: readonly ValKey[],
    updater: (
        val: Value extends null | undefined ? null | undefined : Pick<Value, DepKey>,
    ) => Pick<Sk, ValKey>,
): Sk;
