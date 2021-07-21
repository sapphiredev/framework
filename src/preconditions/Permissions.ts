import { Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
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
		const required = (context.permissions as Permissions) ?? new Permissions();
		const channel = message.channel as TextChannel | NewsChannel;

		const permissions = message.guild ? channel.permissionsFor(message.client.id!)! : this.dmChannelPermissions;
		const missing = permissions.missing(required);
		return missing.length === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionPermissions,
					message: `I am missing the following permissions to run this command: ${missing
						.map((perm) => CorePrecondition.readablePermissions[perm])
						.join(', ')}`,
					context: { missing }
			  });
	}

	protected static readonly readablePermissions = {
		ADD_REACTIONS: 'Add Reactions',
		ADMINISTRATOR: 'Administrator',
		ATTACH_FILES: 'Attach Files',
		BAN_MEMBERS: 'Ban Members',
		CHANGE_NICKNAME: 'Change Nickname',
		CONNECT: 'Connect',
		CREATE_INSTANT_INVITE: 'Create Instant Invite',
		DEAFEN_MEMBERS: 'Deafen Members',
		EMBED_LINKS: 'Embed Links',
		KICK_MEMBERS: 'Kick Members',
		MANAGE_CHANNELS: 'Manage Channels',
		MANAGE_EMOJIS: 'Manage Emojis',
		MANAGE_GUILD: 'Manage Server',
		MANAGE_MESSAGES: 'Manage Messages',
		MANAGE_NICKNAMES: 'Manage Nicknames',
		MANAGE_ROLES: 'Manage Roles',
		MANAGE_THREADS: 'Manage Threads',
		MANAGE_WEBHOOKS: 'Manage Webhooks',
		MENTION_EVERYONE: 'Mention Everyone',
		MOVE_MEMBERS: 'Move Members',
		MUTE_MEMBERS: 'Mute Members',
		PRIORITY_SPEAKER: 'Priority Speaker',
		READ_MESSAGE_HISTORY: 'Read Message History',
		REQUEST_TO_SPEAK: 'Request to Speak',
		SEND_MESSAGES: 'Send Messages',
		SEND_TTS_MESSAGES: 'Send TTS Messages',
		SPEAK: 'Speak',
		STREAM: 'Stream',
		USE_APPLICATION_COMMANDS: 'Use Application Commands',
		USE_EXTERNAL_EMOJIS: 'Use External Emojis',
		USE_PRIVATE_THREADS: 'Use Private Threads',
		USE_PUBLIC_THREADS: 'Use Public Threads',
		USE_VAD: 'Use Voice Activity',
		VIEW_AUDIT_LOG: 'View Audit Log',
		VIEW_CHANNEL: 'Read Messages',
		VIEW_GUILD_INSIGHTS: 'View Guild Insights'
	};
}
