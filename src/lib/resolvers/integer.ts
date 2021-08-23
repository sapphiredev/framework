import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export function resolveInteger(
	parameter: string,
	options?: { minimum?: number; maximum?: number }
): Result<number, Identifiers.ArgumentIntegerError | Identifiers.ArgumentIntegerTooSmall | Identifiers.ArgumentIntegerTooLarge> {
	const parsed = Number(parameter);
	if (!Number.isInteger(parsed)) return err(Identifiers.ArgumentIntegerError);

	if (typeof options?.minimum === 'number' && parsed < options.minimum) return err(Identifiers.ArgumentIntegerTooSmall);
	if (typeof options?.maximum === 'number' && parsed > options.maximum) return err(Identifiers.ArgumentIntegerTooLarge);

	return ok(parsed);
}
