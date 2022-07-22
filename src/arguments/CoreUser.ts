import type { PieceContext } from '@sapphire/pieces';
import type { User } from 'discord.js';
import { resolveUser } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(parameter: string, context: Argument.Context): Argument.AsyncResult<User> {
		const resolved = await resolveUser(parameter);
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: 'The given argument did not resolve to a Discord user.',
			context
		});
	}
}
