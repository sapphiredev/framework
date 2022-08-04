import type { NonNullObject } from '@sapphire/utilities';
import importedObjectHash from 'object-hash';

export function objectHash<T extends NonNullObject>(object: T): string {
	return importedObjectHash(object);
}
