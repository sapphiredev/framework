import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public run(message: Message): PreconditionResult {
		return message.thread?.type === 'GUILD_PUBLIC_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPublicThreadOnly,
					message: 'You can only run this command in public server thread channels.'
			  });
	}
}
