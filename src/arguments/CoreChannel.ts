import type { ChannelTypes } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { resolveChannel } from '../lib/resolvers/channel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<ChannelTypes> {
	public constructor(context: PieceContext) {
		super(context, { name: 'channel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<ChannelTypes> {
		const resolved = resolveChannel(parameter, context.message);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a channel.',
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<ChannelTypes> {
		const resolved = context.useStringResolver
			? resolveChannel(context.interaction.options.getString(name) ?? '', context.interaction)
			: resolveChannel(context.interaction.options.getChannel(name)?.id ?? '', context.interaction);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a channel.',
				context
			})
		);
	}
}
