import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	private readonly allowedTypes: Message['channel']['type'][] = ['GUILD_NEWS', 'GUILD_NEWS_THREAD'];

	public run(message: Message): PreconditionResult {
		return this.allowedTypes.includes(message.channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsOnly,
					message: 'You can only run this command in server announcement channels.'
			  });
	}
}
