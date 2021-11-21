import type { PieceContext } from '@sapphire/pieces';
import type { URL } from 'url';
import { resolveHyperlink } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<URL> {
	public constructor(context: PieceContext) {
		super(context, { name: 'hyperlink', aliases: ['url'] });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<URL> {
		const resolved = resolveHyperlink(parameter);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: 'The argument did not resolve to a valid URL.',
			context
		});
	}
}
