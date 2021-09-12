import { Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext, PreconditionResult } from '../lib/structures/Precondition';
import { CorePrecondition as ClientPermissionsPrecondition } from './ClientPermissions';

export class CorePrecondition extends Precondition {
	private readonly dmChannelPermissions = new Permissions(
		~new Permissions([
			'ADD_REACTIONS',
			'ATTACH_FILES',
			'EMBED_LINKS',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES',
			'USE_EXTERNAL_EMOJIS',
			'VIEW_CHANNEL',
			'USE_EXTERNAL_STICKERS',
			'MENTION_EVERYONE'
		]).bitfield & Permissions.ALL
	).freeze();

	public run(message: Message, _command: Command, context: PreconditionContext): PreconditionResult {
		const required = (context.permissions as Permissions) ?? new Permissions();
		const channel = message.channel as TextChannel | NewsChannel;

		const permissions = message.guild ? channel.permissionsFor(message.author) : this.dmChannelPermissions;

		if (!permissions) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoPermissions,
				message: "I was unable to resolve the end-user's permissions in the command invocation channel."
			});
		}

		const missing = permissions.missing(required);
		return missing.length === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionUserPermissions,
					message: `You are missing the following permissions to run this command: ${missing
						.map((perm) => ClientPermissionsPrecondition.readablePermissions[perm])
						.join(', ')}`,
					context: { missing }
			  });
	}
}
