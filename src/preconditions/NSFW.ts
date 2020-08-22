import { Precondition } from '../lib/structures/Precondition';
import type { Message } from 'discord.js';
import type { Awaited } from '@sapphire/pieces';

export class CorePrecondition extends Precondition {
	public run(message: Message): Awaited<boolean> {
		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning`false`.
		return Reflect.get(message.channel, 'nsfw') === true;
	}
}
