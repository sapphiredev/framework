import type { NonNullObject } from '@sapphire/utilities';
import deterministicJsonStringify from 'json-stringify-deterministic';

export function objectHash<T extends NonNullObject>(object: T): string {
	return deterministicJsonStringify(object);
}
