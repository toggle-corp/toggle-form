import { PurgeNull } from './types';

// eslint-disable-next-line import/prefer-default-export
export function removeNull<T>(
    data: T,
    ignoreKeys?: string[] | null | undefined,
): PurgeNull<T>;
