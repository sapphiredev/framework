import { Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveString(
	parameter: string,
	options?: { maximum?: number; minimum?: number }
): Result<string, Identifiers.ArgumentStringTooLong | Identifiers.ArgumentStringTooShort> {
	if (typeof options?.minimum === 'number' && parameter.length < options.minimum) {
		return Result.err(Identifiers.ArgumentStringTooShort);
	}

	if (typeof options?.maximum === 'number' && parameter.length > options.maximum) {
		return Result.err(Identifiers.ArgumentStringTooLong);
	}

	return Result.ok(parameter);
}
