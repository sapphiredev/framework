import { err, ok, Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveNumber(
	parameter: string,
	options?: { minimum?: number; maximum?: number }
): Result<number, Identifiers.ArgumentNumberError | Identifiers.ArgumentNumberTooSmall | Identifiers.ArgumentNumberTooLarge> {
	const parsed = Number(parameter);
	if (Number.isNaN(parsed)) return err(Identifiers.ArgumentNumberError);

	if (typeof options?.minimum === 'number' && parsed < options.minimum) return err(Identifiers.ArgumentNumberTooSmall);
	if (typeof options?.maximum === 'number' && parsed > options.maximum) return err(Identifiers.ArgumentNumberTooLarge);

	return ok(parsed);
}
