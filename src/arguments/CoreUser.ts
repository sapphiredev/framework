import type { PieceContext } from '@sapphire/pieces';
import { Constants, DiscordAPIError, User } from 'discord.js';
import { Argument, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(argument: string): AsyncArgumentResult<User> {
		try {
			return this.ok(await this.client.users.fetch(argument));
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === Constants.APIErrors.UNKNOWN_USER) {
				return this.error(argument, 'ArgumentUserUnknownUser', 'The argument did not resolve to a user.');
			}

			return this.error(argument, 'ArgumentUserUnknownError', 'The argument found an unexpected error when retrieving a user.');
		}
	}
}
