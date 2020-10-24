import type { PieceContext } from '@sapphire/pieces';
import { User } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}
	
	private async parseID(argument: string): Promise<User|undefined> {
		if (/^\d+$/.test(argument)) {
			try {
				return await this.client.users.fetch(argument);
			} catch {
				// noop
			}
		}
		return undefined;
	}
	
	private async parseMention(argument: string): Promise<User|undefined> {
		if (/^<@!*\d+>$/.test(argument)) {
			return await this.parseID(
				argument
					.replace("<@", "")
					.replace("!", "")
					.replace(">", "")
			);
		}
		return undefined;
	}
	
	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<User> {
		const user = await this.parseID(argument)
			?? await this.parseMention(argument);

		return user ? this.ok(user) : this.error(
			argument,
			"ArgumentUserUnknownUser",
			"The argument did not resolve to a user."
		);
	}
}
