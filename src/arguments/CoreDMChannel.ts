import { ChannelTypes, isDMChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'channel', DMChannel> {
	public constructor(context: PieceContext) {
		super(context, { baseArgument: 'channel', name: 'dmChannel' });
	}

	public handle(channel: ChannelTypes, context: ExtendedArgumentContext): ArgumentResult<DMChannel> {
		return isDMChannel(channel)
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a DM channel.',
					context: { ...context, channel }
			  });
	}
}
