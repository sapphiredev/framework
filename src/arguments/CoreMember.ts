import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, GuildMember, Snowflake } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildMember> {
	public constructor(context: PieceContext) {
		super(context, { name: 'member' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<GuildMember> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentMemberMissingGuild,
				message: 'The argument must be run on a guild.',
				context: { ...context, guild }
			});
		}

		const member = (await this.resolveById(parameter, guild)) ?? (await this.resolveByQuery(parameter, guild));
		return member
			? this.ok(member)
			: this.error({
					parameter,
					message: 'The argument did not resolve to a member.',
					context: { ...context, guild }
			  });
	}

	private async resolveById(argument: string, guild: Guild): Promise<GuildMember | null> {
		const memberId = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return memberId ? guild.members.fetch(memberId[1] as Snowflake).catch(() => null) : null;
	}

	private async resolveByQuery(argument: string, guild: Guild): Promise<GuildMember | null> {
		const members = await guild.members
			.fetch({
				query: argument,
				limit: 1
			})
			.catch(() => null);
		return members?.first() ?? null;
	}
}
