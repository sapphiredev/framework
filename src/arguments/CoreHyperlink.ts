import { container } from '@sapphire/pieces';
import type { URL } from 'node:url';
import { resolveHyperlink } from '../lib/resolvers/hyperlink';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<URL> {
	public constructor(context: Argument.LoaderContext) {
		super(context, { name: 'hyperlink', aliases: ['url'] });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<URL> {
		const resolved = resolveHyperlink(parameter);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a valid URL.',
				context
			})
		);
	}
}

void container.stores.loadPiece({
	name: 'hyperlink',
	piece: CoreArgument,
	store: 'arguments'
});
