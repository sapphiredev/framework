import type { PieceContext } from '@sapphire/pieces';
import type { GuildMember, Guild } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildMember> {
	private readonly userOrMemberRegex = /^(?:<@!?)?(\d{17,19})>?$/;

	public constructor(context: PieceContext) {
		super(context, { name: 'member' });
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<GuildMember> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentMemberMissingGuild', 'The argument must be run on a guild.');
		}

		const member = (await this.resolveByID(argument, guild)) ?? (await this.resolveByQuery(argument, guild));
		return member ? this.ok(member) : this.error(argument, 'ArgumentMemberUnknownMember', 'The argument did not resolve to a member.');
	}

	private async resolveByID(argument: string, guild: Guild): Promise<GuildMember | null> {
		const memberID = this.userOrMemberRegex.exec(argument);
		return memberID ? guild.members.fetch(memberID[1]).catch(() => null) : null;
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
