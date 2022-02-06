import { err, ok, Result } from '@sapphire/result';
import { Identifiers } from '../errors/Identifiers';

const baseTruths = ['1', 'true', '+', 't', 'yes', 'y'] as const;
const baseFalses = ['0', 'false', '-', 'f', 'no', 'n'] as const;

export function resolveBoolean(
	parameter: string,
	customs?: { truths?: readonly string[]; falses?: readonly string[] }
): Result<boolean, Identifiers.ArgumentBooleanError> {
	const boolean = parameter.toLowerCase();
	if ([...baseTruths, ...(customs?.truths ?? [])].includes(boolean)) return ok(true);
	if ([...baseFalses, ...(customs?.falses ?? [])].includes(boolean)) return ok(false);

	return err(Identifiers.ArgumentBooleanError);
}
