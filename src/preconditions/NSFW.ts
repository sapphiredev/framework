import type { Message } from 'discord.js';
import { Precondition, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public run(message: Message): PreconditionResult {
		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning`false`.
		return Reflect.get(message.channel, 'nsfw') === true
			? this.ok()
			: this.error(this.name, 'You cannot run this command outside NSFW channels.');
	}
}
