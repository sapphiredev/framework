import type { PieceContext } from '@sapphire/pieces';
import type { GuildMember, Guild } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildMember> {
	public constructor(context: PieceContext) {
		super(context, { name: 'member' });
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<GuildMember> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentMemberMissingGuild', 'The argument must be run on a guild.');
		}

		const member =
			(await this.parseID(argument, guild)) ?? (await this.parseMention(argument, guild)) ?? (await this.parseQuery(argument, guild));

		return member ? this.ok(member) : this.error(argument, 'ArgumentMemberUnknownMember', 'The argument did not resolve to a member.');
	}

	private async parseID(argument: string, guild: Guild): Promise<GuildMember | null> {
		if (/^\d+$/.test(argument)) {
			try {
				return await guild.members.fetch(argument);
			} catch {
				// noop
			}
		}
		return null;
	}

	private async parseMention(argument: string, guild: Guild): Promise<GuildMember | null> {
		const mention = /^<@!?(\d+)>$/.exec(argument);
		return mention ? await this.parseID(mention[1], guild) : null;
	}

	private async parseQuery(argument: string, guild: Guild): Promise<GuildMember | null> {
		const member = await guild.members.fetch({
			query: argument,
			limit: 1
		});
		return member.values().next().value ?? null;
	}
}
