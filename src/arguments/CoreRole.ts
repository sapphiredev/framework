import { RoleMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, Role, Snowflake } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<Role> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentRoleMissingGuild,
				message: 'The argument must be run on a guild.',
				context
			});
		}

		const role = (await this.resolveById(parameter, guild)) ?? this.resolveByQuery(parameter, guild);
		return role ? this.ok(role) : this.error({ parameter, message: 'The argument did not resolve to a role.', context });
	}

	private async resolveById(argument: string, guild: Guild): Promise<Role | null> {
		const roleId = RoleMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return roleId ? guild.roles.fetch(roleId[1] as Snowflake).catch(() => null) : null;
	}

	private resolveByQuery(argument: string, guild: Guild): Role | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.roles.cache.find((role) => role.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
