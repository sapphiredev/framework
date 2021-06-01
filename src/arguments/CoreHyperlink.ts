import type { PieceContext } from '@sapphire/pieces';
import { URL } from 'url';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<URL> {
	public constructor(context: PieceContext) {
		super(context, { name: 'hyperlink', aliases: ['url'] });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<URL> {
		const resolved = CoreArgument.resolve(parameter);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({ parameter, message: resolved.error, context });
	}

	public static resolve(parameter: string): Result<URL, string> {
		try {
			return ok(new URL(parameter));
		} catch {
			return err('The argument did not resolve to a valid URL.');
		}
	}
}
