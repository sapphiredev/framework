import { err, ok, Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveFloat(
	parameter: string,
	options?: { minimum?: number; maximum?: number }
): Result<number, Identifiers.ArgumentFloatError | Identifiers.ArgumentFloatTooSmall | Identifiers.ArgumentFloatTooLarge> {
	const parsed = Number(parameter);
	if (Number.isNaN(parsed)) return err(Identifiers.ArgumentFloatError);

	if (typeof options?.minimum === 'number' && parsed < options.minimum) return err(Identifiers.ArgumentFloatTooSmall);
	if (typeof options?.maximum === 'number' && parsed > options.maximum) return err(Identifiers.ArgumentFloatTooLarge);

	return ok(parsed);
}
