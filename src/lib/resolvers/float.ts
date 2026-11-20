import { Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveFloat(
	parameter: string,
	options?: { maximum?: number; minimum?: number }
): Result<number, Identifiers.ArgumentFloatError | Identifiers.ArgumentFloatTooLarge | Identifiers.ArgumentFloatTooSmall> {
	const parsed = Number(parameter);

	if (Number.isNaN(parsed)) {
		return Result.err(Identifiers.ArgumentFloatError);
	}

	if (typeof options?.minimum === 'number' && parsed < options.minimum) {
		return Result.err(Identifiers.ArgumentFloatTooSmall);
	}

	if (typeof options?.maximum === 'number' && parsed > options.maximum) {
		return Result.err(Identifiers.ArgumentFloatTooLarge);
	}

	return Result.ok(parsed);
}
