import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export function resolveEnum(
	parameter: string,
	options?: { enum?: string[] }
): Result<string, Identifiers.ArgumentEnumEmptyError | Identifiers.ArgumentEnumError> {
	if (!options?.enum?.length) {
		return err(Identifiers.ArgumentEnumEmptyError);
	}

	if (!options?.enum?.includes(parameter)) {
		return err(Identifiers.ArgumentEnumError);
	}

	return ok(parameter);
}
