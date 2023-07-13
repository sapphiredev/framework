import type { PieceContext } from '@sapphire/pieces';
import type { GuildMember } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveMember } from '../lib/resolvers/member';
import { Argument } from '../lib/structures/Argument';
import type { MemberArgumentContext } from '../lib/types/ArgumentContexts';

export class CoreArgument extends Argument<GuildMember> {
	public constructor(context: PieceContext) {
		super(context, { name: 'member' });
	}

	public override async messageRun(parameter: string, context: MemberArgumentContext): Argument.AsyncResult<GuildMember> {
		const { guild } = context.message;

		if (!guild) return this.guildError(parameter, context);

		const resolved = await resolveMember(parameter, guild, context.performFuzzySearch ?? true);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a server member.',
				context: { ...context, guild }
			})
		);
	}

	public override async chatInputRun(
		name: string,
		context: Pick<MemberArgumentContext, 'performFuzzySearch'> & Argument.ChatInputContext
	): Argument.AsyncResult<GuildMember> {
		const { guild } = context.interaction;

		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? await resolveMember(context.interaction.options.getString(name) ?? '', guild, context.performFuzzySearch ?? true)
			: await resolveMember(context.interaction.options.getUser(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a server member.',
				context: { ...context, guild }
			})
		);
	}

	private guildError(
		parameter: string,
		context: Pick<MemberArgumentContext, 'performFuzzySearch'> & (MemberArgumentContext | Argument.ChatInputContext)
	) {
		return this.error({
			parameter,
			identifier: Identifiers.ArgumentMemberMissingGuild,
			message: 'This command can only be used in a server.',
			context
		});
	}
}
