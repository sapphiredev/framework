import type { PieceContext } from '@sapphire/pieces';
import type { Role } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<Role> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentRoleMissingGuild', 'The argument must be run on a guild.');
		}

		const role = guild.roles.cache.get(argument);
		if (!role) {
			return this.error(argument, 'ArgumentRoleMissingRole', 'The argument did not resolve to a role.');
		}

		return this.ok(role);
	}
}
