import type { Message } from 'discord.js';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public run(message: Message): PreconditionResult {
		return message.guild === null ? this.ok() : this.error(this.name, 'You cannot run this command outside DMs.');
	}
}
