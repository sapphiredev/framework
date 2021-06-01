import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, GuildMember } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

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

		const resolved = await CoreArgument.resolve(parameter, guild);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			message: resolved.error,
			context: { ...context, guild }
		});
	}

	public static async resolve(parameter: string, guild: Guild): Promise<Result<GuildMember, string>> {
		const member = (await CoreArgument.resolveByID(parameter, guild)) ?? (await CoreArgument.resolveByQuery(parameter, guild));
		if (member) return ok(member);
		return err('The argument did not resolve to a member.');
	}

	private static async resolveByID(argument: string, guild: Guild): Promise<GuildMember | null> {
		const memberID = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return memberID ? guild.members.fetch(memberID[1]).catch(() => null) : null;
	}

	private static async resolveByQuery(argument: string, guild: Guild): Promise<GuildMember | null> {
		const members = await guild.members
			.fetch({
				query: argument,
				limit: 1
			})
			.catch(() => null);
		return members?.first() ?? null;
	}
}
