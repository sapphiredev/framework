import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	private readonly allowedTypes: Message['channel']['type'][] = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'];

	public run(message: Message): PreconditionResult {
		return this.allowedTypes.includes(message.channel.type)
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionGuildTextOnly, message: 'You can only run this command in server text channels.' });
	}
}
