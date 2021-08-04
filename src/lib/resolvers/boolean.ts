import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

const baseTruths = ['1', 'true', '+', 't', 'yes', 'y'];
const baseFalses = ['0', 'false', '-', 'f', 'no', 'n'];

export function resolveBoolean(
	parameter: string,
	customs?: { truths?: string[]; falses?: string[] }
): Result<boolean, Identifiers.ArgumentBooleanError> {
	const boolean = parameter.toLowerCase();
	if ([...baseTruths, ...(customs?.truths ?? [])].includes(boolean)) return ok(true);
	if ([...baseFalses, ...(customs?.falses ?? [])].includes(boolean)) return ok(false);

	return err(Identifiers.ArgumentBooleanError);
}
