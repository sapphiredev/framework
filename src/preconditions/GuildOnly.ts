import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { UserError } from '../lib/errors/UserError';
import { Precondition } from '../lib/structures/Precondition';
import { err, ok, Result } from '../lib/utils/Result';

export class CorePrecondition extends Precondition {
	public run(message: Message): Awaited<Result<unknown, UserError>> {
		return message.guild === null ? err(new UserError(this.name, 'You cannot run this command in DMs.')) : ok();
	}
}
