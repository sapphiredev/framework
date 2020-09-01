import type { Message } from 'discord.js';
import { UserError } from '../lib/errors/UserError';
import { Precondition } from '../lib/structures/Precondition';
import { err, ok, Result } from '../lib/utils/Result';
import type { Awaited } from '../lib/utils/Types';

export class CorePrecondition extends Precondition {
	public run(message: Message): Awaited<Result<unknown, UserError>> {
		if (message.channel.type === 'dm') return ok();
		if (!message.member) return err(new UserError(this.name, 'Member is null.'));

		const clientPermissions = message.member.permissionsIn(message.channel);
		return clientPermissions.has(378944) ? ok() : err(new UserError(this.name, 'Missing permissions.'));
	}
}
