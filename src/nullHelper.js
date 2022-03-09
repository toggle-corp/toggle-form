import {
    isObject,
    isList,
    isDefined,
} from '@togglecorp/fujs';

// eslint-disable-next-line import/prefer-default-export
export function removeNull(
    data,
    ignoreKeys = ['__typename'],
) {
    if (data === null || data === undefined) {
        return undefined;
    }
    if (isList(data)) {
        return data
            .map((item) => removeNull(item, ignoreKeys))
            .filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        Object.keys(data).forEach((k) => {
            const key = k;
            if (ignoreKeys && ignoreKeys.includes(key)) {
                return;
            }

            const val = data[key];
            const newEntry = removeNull(val, ignoreKeys);
            if (isDefined(newEntry)) {
                newData = {
                    ...newData,
                    [key]: newEntry,
                };
            }
        });
        return newData;
    }
    return data;
}
