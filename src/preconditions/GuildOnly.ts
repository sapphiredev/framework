import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public messageRun(message: Message): PreconditionResult {
		return message.guild === null
			? this.error({ identifier: Identifiers.PreconditionGuildOnly, message: 'You cannot run this command in DMs.' })
			: this.ok();
	}
}
