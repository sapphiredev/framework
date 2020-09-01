import type { Message } from 'discord.js';
import { UserError } from '../lib/errors/UserError';
import { Precondition } from '../lib/structures/Precondition';
import { err, ok, Result } from '../lib/utils/Result';
import type { Awaited } from '../lib/utils/Types';

export class CorePrecondition extends Precondition {
	public run(message: Message): Awaited<Result<unknown, UserError>> {
		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning`false`.
		return Reflect.get(message.channel, 'nsfw') === true
			? ok()
			: err(new UserError(this.name, 'You cannot run this command outside NSFW channels.'))
	}
}
