import type { PieceContext } from '@sapphire/pieces';
import type { Guild, Role } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<Role> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentRoleMissingGuild', 'The argument must be run on a guild.');
		}

		const role = (await this.parseID(argument, guild)) ?? (await this.parseMention(argument, guild)) ?? (await this.parseQuery(argument, guild));

		return role ? this.ok(role) : this.error(argument, 'ArgumentRoleUnknownRole', 'The argument did not resolve to a role.');
	}

	private async parseID(argument: string, guild: Guild): Promise<Role | null> {
		if (/^\d{17,19}$/.test(argument)) {
			try {
				return await guild.roles.fetch(argument);
			} catch {
				// noop
			}
		}
		return null;
	}

	private async parseMention(argument: string, guild: Guild): Promise<Role | null> {
		const mention = /^<@&(\d{17,19})>$/.exec(argument);
		return mention ? this.parseID(mention[1], guild) : null;
	}

	private async parseQuery(argument: string, guild: Guild): Promise<Role | null> {
		const lowerCaseArgument = argument.toLowerCase();
		const role = await guild.roles.cache.find((role) => role.name.toLowerCase() === lowerCaseArgument);
		return role ?? null;
	}
}
