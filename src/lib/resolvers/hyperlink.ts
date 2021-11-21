import { URL } from 'url';
import { Identifiers } from '../errors/Identifiers';
import { err, from, isOk, Result } from '../parsers/Result';

export function resolveHyperlink(parameter: string): Result<URL, Identifiers.ArgumentHyperlinkError> {
	const result = from(() => new URL(parameter));
	return isOk(result) ? result : err(Identifiers.ArgumentHyperlinkError);
}
