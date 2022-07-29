import type { PieceContext } from '@sapphire/pieces';
import { EmojiObject, resolveEmoji } from '../lib/resolvers/emoji';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<EmojiObject> {
	public constructor(context: PieceContext) {
		super(context, { name: 'emoji' });
	}

	public run(parameter: string): ArgumentResult<EmojiObject> {
		const resolved = resolveEmoji(parameter);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to an emoji.'
			})
		);
	}
}
