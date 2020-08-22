import { Precondition } from '../lib/structures/Precondition';
import type { Message } from 'discord.js';
import type { Awaited } from '@sapphire/pieces';

export class CorePrecondition extends Precondition {
	public run(message: Message): Awaited<boolean> {
		return message.guild !== null;
	}
}
