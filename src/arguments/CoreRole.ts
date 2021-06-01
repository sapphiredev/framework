import { RoleMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, Role } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

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

		const resolved = await CoreArgument.resolve(parameter, guild);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({ parameter, message: resolved.error, context });
	}

	public static async resolve(parameter: string, guild: Guild): Promise<Result<Role, string>> {
		const role = (await CoreArgument.resolveByID(parameter, guild)) ?? CoreArgument.resolveByQuery(parameter, guild);
		if (role) return ok(role);
		return err('The argument did not resolve to a role.');
	}

	private static async resolveByID(argument: string, guild: Guild): Promise<Role | null> {
		const roleID = RoleMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return roleID ? guild.roles.fetch(roleID[1]).catch(() => null) : null;
	}

	private static resolveByQuery(argument: string, guild: Guild): Role | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.roles.cache.find((role) => role.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
