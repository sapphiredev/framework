import { URL } from 'url';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export function resolveHyperlink(parameter: string): Result<URL, Identifiers.ArgumentHyperlinkError> {
	try {
		return ok(new URL(parameter));
	} catch {
		return err(Identifiers.ArgumentHyperlinkError);
	}
}
