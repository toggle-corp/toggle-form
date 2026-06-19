import {
    isObject,
    isList,
    isDefined,
} from '@togglecorp/fujs';
import { PurgeNull } from './types';

// eslint-disable-next-line import/prefer-default-export
export function removeNull<T>(
    data: T,
    ignoreKeys: string[] | null | undefined = ['__typename'],
): PurgeNull<T> {
    if (data === null || data === undefined) {
        return undefined as PurgeNull<T>;
    }
    if (isList(data)) {
        return (data as unknown[])
            .map((item) => removeNull(item, ignoreKeys))
            .filter(isDefined) as PurgeNull<T>;
    }
    if (isObject(data)) {
        return (Object.keys(data as object) as string[]).reduce<Record<string, unknown>>(
            (acc, key) => {
                if (ignoreKeys && ignoreKeys.includes(key)) {
                    return acc;
                }
                const val = (data as Record<string, unknown>)[key];
                const newEntry = removeNull(val, ignoreKeys);
                if (isDefined(newEntry)) {
                    return { ...acc, [key]: newEntry };
                }
                return acc;
            },
            {},
        ) as PurgeNull<T>;
    }
    return data as PurgeNull<T>;
}
