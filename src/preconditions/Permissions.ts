import { Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	private readonly dmChannelPermissions = new Permissions([
		Permissions.FLAGS.VIEW_CHANNEL,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.SEND_TTS_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.ATTACH_FILES,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
		Permissions.FLAGS.MENTION_EVERYONE,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
		Permissions.FLAGS.ADD_REACTIONS
	]).freeze();

	public run(message: Message, _command: Command, context: PreconditionContext): PreconditionResult {
		const required = (context.permissions as Permissions) ?? new Permissions(0);
		const permissions = message.guild
			? (message.channel as TextChannel | NewsChannel).permissionsFor(message.client.id!)!
			: this.dmChannelPermissions;
		const missing = permissions.missing(required);
		return missing.length === 0 ? this.ok() : this.error(this.name, 'I am missing permissions to run this command.', missing);
	}
}
