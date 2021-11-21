import type { PieceContext } from '@sapphire/pieces';
import type { Role } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveRole } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Role> {
	public constructor(context: PieceContext) {
		super(context, { name: 'role' });
	}

	public async run(parameter: string, context: Argument.Context): Argument.AsyncResult<Role> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentRoleMissingGuild,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = await resolveRole(parameter, guild);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: 'The given argument did not resolve to a role.',
			context: { ...context, guild }
		});
	}
}
