import { Result } from '@sapphire/result';
import { URL } from 'url';
import { Identifiers } from '../errors/Identifiers';

export function resolveHyperlink(parameter: string): Result<URL, Identifiers.ArgumentHyperlinkError> {
	const result = Result.from(() => new URL(parameter));
	return result.isOk() ? result : Result.err(Identifiers.ArgumentHyperlinkError);
}
