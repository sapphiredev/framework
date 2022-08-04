import { Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveEnum(
	parameter: string,
	options?: { enum?: string[]; caseInsensitive?: boolean }
): Result<string, Identifiers.ArgumentEnumEmptyError | Identifiers.ArgumentEnumError> {
	if (!options?.enum?.length) {
		return Result.err(Identifiers.ArgumentEnumEmptyError);
	}

	if (!options.caseInsensitive && !options.enum.includes(parameter)) {
		return Result.err(Identifiers.ArgumentEnumError);
	}

	if (options.caseInsensitive && !options.enum.some((v) => v.toLowerCase() === parameter.toLowerCase())) {
		return Result.err(Identifiers.ArgumentEnumError);
	}

	return Result.ok(parameter);
}
