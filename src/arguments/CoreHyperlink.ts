import type { PieceContext } from '@sapphire/pieces';
import { URL } from 'url';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<URL> {
	public constructor(context: PieceContext) {
		super(context, { name: 'hyperlink', aliases: ['url'] });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<URL> {
		try {
			return this.ok(new URL(parameter));
		} catch {
			return this.error({
				parameter,
				identifier: 'ArgumentHyperlinkInvalidURL',
				message: 'The argument did not resolve to a valid URL.',
				context
			});
		}
	}
}
