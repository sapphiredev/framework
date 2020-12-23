import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { User } from 'discord.js';
import { Argument, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(argument: string): AsyncArgumentResult<User> {
		const userID = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		const user = userID ? await this.context.client.users.fetch(userID[1]).catch(() => null) : null;
		return user ? this.ok(user) : this.error(argument, 'ArgumentUserUnknownUser', 'The argument did not resolve to a user.');
	}
}
