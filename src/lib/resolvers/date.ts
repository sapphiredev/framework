import { Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

export function resolveDate(
	parameter: string,
	options?: { minimum?: number; maximum?: number }
): Result<Date, Identifiers.ArgumentDateError | Identifiers.ArgumentDateTooEarly | Identifiers.ArgumentDateTooFar> {
	const parsed = new Date(parameter);

	const time = parsed.getTime();
	if (Number.isNaN(time)) return Result.err(Identifiers.ArgumentDateError);

	if (typeof options?.minimum === 'number' && time < options.minimum) return Result.err(Identifiers.ArgumentDateTooEarly);
	if (typeof options?.maximum === 'number' && time > options.maximum) return Result.err(Identifiers.ArgumentDateTooFar);

	return Result.ok(parsed);
}
