import {
    createSubmitHandler,
} from './submissionHelper';

test('failure condition', () => {
    type Obj = {
        name: string;
    };

    const setError = jest.fn();
    const successHandler = jest.fn();
    const failureHandler = jest.fn();

    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const event = {
        preventDefault,
        stopPropagation,
    } as unknown as React.FormEvent<HTMLFormElement>;

    const handler = createSubmitHandler<Obj>(
        () => ({
            errored: true,
            error: { name: 'This field is required' },
            value: undefined,
        }),
        setError,
        successHandler,
        failureHandler,
    );
    handler(event);

    expect(preventDefault).toBeCalledTimes(1);
    expect(stopPropagation).toBeCalledTimes(1);
    expect(setError).toBeCalledTimes(1);
    expect(setError).toBeCalledWith({ name: 'This field is required' }, undefined);
    expect(failureHandler).toBeCalledTimes(1);
    expect(failureHandler).toBeCalledWith(undefined, { name: 'This field is required' });
    expect(successHandler).toBeCalledTimes(0);

    setError.mockClear();
    successHandler.mockClear();
    failureHandler.mockClear();
    preventDefault.mockClear();
    stopPropagation.mockClear();

    const handlerWithoutErrorCallback = createSubmitHandler<Obj>(
        () => ({
            errored: true,
            error: { name: 'This field is required' },
            value: undefined,
        }),
        setError,
        successHandler,
    );
    handlerWithoutErrorCallback();

    expect(setError).toBeCalledTimes(1);
    expect(setError).toBeCalledWith({ name: 'This field is required' }, undefined);
    expect(successHandler).toBeCalledTimes(0);
});

test('success condition', () => {
    type Obj = {
        name: string;
    };

    const setError = jest.fn();
    const successHandler = jest.fn();
    const failureHandler = jest.fn();

    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const event = {
        preventDefault,
        stopPropagation,
    } as unknown as React.FormEvent<HTMLFormElement>;

    const handler = createSubmitHandler<Obj>(
        () => ({
            errored: false,
            error: undefined,
            value: { name: 'Hari Bahadur' },
        }),
        setError,
        successHandler,
        failureHandler,
    );
    handler(event);

    expect(preventDefault).toBeCalledTimes(1);
    expect(stopPropagation).toBeCalledTimes(1);
    expect(setError).toBeCalledTimes(1);
    expect(setError).toBeCalledWith(undefined, { name: 'Hari Bahadur' });
    expect(successHandler).toBeCalledTimes(1);
    expect(successHandler).toBeCalledWith({ name: 'Hari Bahadur' });
    expect(failureHandler).toBeCalledTimes(0);
});
