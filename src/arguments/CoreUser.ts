import type { PieceContext } from '@sapphire/pieces';
import type { User } from 'discord.js';
import { resolveUser } from '../lib/resolvers/user';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public override async messageRun(parameter: string, context: Argument.MessageContext): Argument.AsyncResult<User> {
		const resolved = await resolveUser(parameter);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a Discord user.',
				context
			})
		);
	}

	public override async chatInputRun(name: string, context: Argument.ChatInputContext): Argument.AsyncResult<User> {
		const resolved = context.useStringResolver
			? await resolveUser(context.interaction.options.getString(name) ?? '')
			: await resolveUser(context.interaction.options.getUser(name)?.id ?? '');
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a Discord user.',
				context
			})
		);
	}
}
