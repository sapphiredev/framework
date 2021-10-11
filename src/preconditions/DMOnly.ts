import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public messageRun(message: Message): PreconditionResult {
		return message.guild === null
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionDMOnly, message: 'You cannot run this command outside DMs.' });
	}
}
