import { err, ok, Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveEnum(
	parameter: string,
	options?: { enum?: string[]; caseInsensitive?: boolean }
): Result<string, Identifiers.ArgumentEnumEmptyError | Identifiers.ArgumentEnumError> {
	if (!options?.enum?.length) {
		return err(Identifiers.ArgumentEnumEmptyError);
	}

	if (!options.caseInsensitive && !options.enum.includes(parameter)) {
		return err(Identifiers.ArgumentEnumError);
	}

	if (options.caseInsensitive && !options.enum.some((v) => v.toLowerCase() === parameter.toLowerCase())) {
		return err(Identifiers.ArgumentEnumError);
	}

	return ok(parameter);
}
