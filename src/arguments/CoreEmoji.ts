import type { PieceContext } from '@sapphire/pieces';
import { resolveEmoji, type EmojiObject } from '../lib/resolvers/emoji';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<EmojiObject> {
	public constructor(context: PieceContext) {
		super(context, { name: 'emoji' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<EmojiObject> {
		const resolved = resolveEmoji(parameter);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to an emoji.',
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<EmojiObject> {
		const resolved = resolveEmoji(context.interaction.options.getString(name) ?? '');
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to an emoji.',
				context
			})
		);
	}
}
