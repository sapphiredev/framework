import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { User, UserManager } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<User> {
		const resolved = await CoreArgument.resolve(parameter, this.container.client.users);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({ parameter, message: resolved.error, context });
	}

	public static async resolve(parameter: string, users: UserManager): Promise<Result<User, string>> {
		const userID = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
		const user = userID ? await users.fetch(userID[1]).catch(() => null) : null;
		if (user) return ok(user);
		return err('The argument did not resolve to a user.');
	}
}
