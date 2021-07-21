import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Snowflake, User } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<User> {
		const userId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
		const user = userId ? await this.container.client.users.fetch(userId[1] as Snowflake).catch(() => null) : null;
		return user ? this.ok(user) : this.error({ parameter, message: 'The argument did not resolve to a user.', context });
	}
}
