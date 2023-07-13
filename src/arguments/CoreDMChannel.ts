import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel } from 'discord.js';
import { resolveDMChannel } from '../lib/resolvers/dmChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<DMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'dmChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<DMChannel> {
		const resolved = resolveDMChannel(parameter, context.message);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a DM channel.',
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<DMChannel> {
		const resolved = resolveDMChannel(context.interaction.options.getString(name) ?? '', context.interaction);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a DM channel.',
				context
			})
		);
	}
}
