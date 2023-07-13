import type { PieceContext } from '@sapphire/pieces';
import type { Role } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveRole } from '../lib/resolvers/role';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public override async messageRun(parameter: string, context: Argument.MessageContext): Argument.AsyncResult<Role> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = await resolveRole(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a role.',
				context: { ...context, guild }
			})
		);
	}

	public override async chatInputRun(name: string, context: Argument.ChatInputContext): Argument.AsyncResult<Role> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? await resolveRole(context.interaction.options.getString(name) ?? '', guild)
			: await resolveRole(context.interaction.options.getRole(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a role.',
				context: { ...context, guild }
			})
		);
	}

	private guildError(parameter: string, context: Argument.MessageContext | Argument.ChatInputContext) {
		return this.error({
			parameter,
			identifier: Identifiers.ArgumentRoleMissingGuild,
			message: 'This command can only be used in a server.',
			context
		});
	}
}
