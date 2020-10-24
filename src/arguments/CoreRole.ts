import type { PieceContext } from '@sapphire/pieces';
import { Guild, Role } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}
	
	private async parseID(argument: string, guild: Guild): Promise<Role|undefined> {
		if (/^\d+$/.test(argument)) {
			return await guild.roles.fetch(argument)
				.catch({
					// noop
				});
		}
		return undefined;
	}
	
	private async parseMention(argument: string, guild: Guild): Promise<Role|undefined> {
		if (/^<@&!*\d+>$/.test(argument)) {
			return await this.parseID(
				argument
					.replace("<@&", "")
					.replace("!", "")
					.replace(">", ""),
				guild
			);
		}
		return undefined;
	}
	
	private async parseQuery(argument: string, guild: Guild): Promise<GuildMember|undefined> {
		const role = await guild.roles.cache
			.find((role) => {
				return role.name.toLowerCase() === argument.toLowerCase()
			});
		return role ? role : undefined
	}
	
	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<GuildMember> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(
				argument,
				"ArgumentRoleMissingGuild",
				"The argument must be run on a guild."
			);
		}

		const role = await this.parseID(argument, guild)
			?? await this.parseMention(argument, guild)
			?? await this.parseQuery(argument, guild);

		return role ? this.ok(role) : this.error(
			argument,
			"ArgumentRoleUnknownRole",
			"The argument did not resolve to a role."
		);
	}
}
