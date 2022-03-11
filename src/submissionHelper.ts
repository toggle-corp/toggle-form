import type { Error } from './schema';
import { ValidateFunc } from './form';

// eslint-disable-next-line import/prefer-default-export
export function createSubmitHandler<T>(
    validator: ValidateFunc<T>,
    setError: (errors: Error<T> | undefined, value: unknown) => void,
    successCallback: (value: T) => void,
    failureCallback?: (value: unknown, errors: Error<T>) => void,
) {
    // NOTE: making event non-mandatory so that it can be used in other usecases
    return (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // NOTE: accumulating value if failureCallback is defined
        const value = validator(!!failureCallback);
        // NOTE: Idk why !value.errored doesn't work here
        if (value.errored === false) {
            setError(value.error, value.value);
            successCallback(value.value);
        } else {
            setError(value.error, value.value);
            if (failureCallback) {
                failureCallback(value.value, value.error);
            }
        }
    };
}
