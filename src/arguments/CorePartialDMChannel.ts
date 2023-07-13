import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel, PartialDMChannel } from 'discord.js';
import { resolvePartialDMChannel } from '../lib/resolvers/partialDMChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<DMChannel | PartialDMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'partialDMChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<DMChannel | PartialDMChannel> {
		const resolved = resolvePartialDMChannel(parameter, context.message);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a Partial DM channel.',
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<DMChannel | PartialDMChannel> {
		const resolved = resolvePartialDMChannel(context.interaction.options.getString(name) ?? '', context.interaction);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a Partial DM channel.',
				context
			})
		);
	}
}
