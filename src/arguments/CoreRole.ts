import { RoleMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, Role } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<Role> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({ parameter, identifier: 'ArgumentRoleMissingGuild', message: 'The argument must be run on a guild.', context });
		}

		const role = (await this.resolveByID(parameter, guild)) ?? this.resolveByQuery(parameter, guild);
		return role
			? this.ok(role)
			: this.error({ parameter, identifier: 'ArgumentRoleUnknownRole', message: 'The argument did not resolve to a role.', context });
	}

	private async resolveByID(argument: string, guild: Guild): Promise<Role | null> {
		const roleID = RoleMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return roleID ? guild.roles.fetch(roleID[1]).catch(() => null) : null;
	}

	private resolveByQuery(argument: string, guild: Guild): Role | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.roles.cache.find((role) => role.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
