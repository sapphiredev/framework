import type { PieceContext } from '@sapphire/pieces';
import type { User } from 'discord.js';
import { Argument, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<User> {
	public constructor(context: PieceContext) {
		super(context, { name: 'user' });
	}

	public async run(argument: string): AsyncArgumentResult<User> {
		const user = (await this.parseID(argument)) ?? (await this.parseMention(argument));

		return user ? this.ok(user) : this.error(argument, 'ArgumentUserUnknownUser', 'The argument did not resolve to a user.');
	}

	private async parseID(argument: string): Promise<User | null> {
		if (/^\d{17,19}$/.test(argument)) {
			try {
				return await this.client.users.fetch(argument);
			} catch {
				// noop
			}
		}
		return null;
	}

	private async parseMention(argument: string): Promise<User | null> {
		const mention = /^<@!?(\d{17,19})>$/.exec(argument);
		return mention ? this.parseID(mention[1]) : null;
	}
}
