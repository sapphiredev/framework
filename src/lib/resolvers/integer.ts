import { Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveInteger(
	parameter: string,
	options?: { minimum?: number; maximum?: number }
): Result<number, Identifiers.ArgumentIntegerError | Identifiers.ArgumentIntegerTooSmall | Identifiers.ArgumentIntegerTooLarge> {
	const parsed = Number(parameter);
	if (!Number.isInteger(parsed)) return Result.err(Identifiers.ArgumentIntegerError);

	if (typeof options?.minimum === 'number' && parsed < options.minimum) return Result.err(Identifiers.ArgumentIntegerTooSmall);
	if (typeof options?.maximum === 'number' && parsed > options.maximum) return Result.err(Identifiers.ArgumentIntegerTooLarge);

	return Result.ok(parsed);
}
