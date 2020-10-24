import type { PieceContext } from '@sapphire/pieces';
import { GuildMember, Guild } from 'discord.js';
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

	private async parseID(argument: string, guild: Guild): Promise<GuildMember | undefined> {
		if (/^\d+$/.test(argument)) {
			try {
				return await guild.members.fetch(argument);
			} catch {
				// noop
			}
		}
		return undefined;
	}

	private async parseMention(argument: string, guild: Guild): Promise<GuildMember | undefined> {
		if (/^<@!*\d+>$/.test(argument)) {
			return await this.parseID(argument.replace('<@', '').replace('!', '').replace('>', ''), guild);
		}
		return undefined;
	}

	private async parseQuery(argument: string, guild: Guild): Promise<GuildMember | undefined> {
		const member = await guild.members.fetch({
			query: argument,
			limit: 1
		});
		return member.values().next().value ?? undefined;
	}
}
