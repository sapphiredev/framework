import type { PieceContext } from '@sapphire/pieces';
import { URL } from 'url';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<URL> {
	public constructor(context: PieceContext) {
		super(context, { name: 'hyperlink', aliases: ['url'] });
	}

	public run(argument: string): ArgumentResult<URL> {
		try {
			return this.ok(new URL(argument));
		} catch {
			return this.error(argument, 'ArgumentHyperlinkInvalidURL', 'The argument did not resolve to a valid URL.');
		}
	}
}
