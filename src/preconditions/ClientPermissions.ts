import { Message, NewsChannel, Permissions, PermissionString, TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	private readonly dmChannelPermissions = new Permissions(
		~new Permissions([
			//
			'ADD_REACTIONS',
			'ATTACH_FILES',
			'EMBED_LINKS',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES',
			'USE_EXTERNAL_EMOJIS',
			'VIEW_CHANNEL'
		]).bitfield & Permissions.ALL
	).freeze();

	public run(message: Message, _command: Command, context: PreconditionContext): PreconditionResult {
		const required = (context.permissions as Permissions) ?? new Permissions();
		const channel = message.channel as TextChannel | NewsChannel;

		if (!message.client.id) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoClient,
				message: 'There was no client to validate the permissions for.'
			});
		}

		const permissions = message.guild ? channel.permissionsFor(message.client.id) : this.dmChannelPermissions;

		if (!permissions) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoPermissions,
				message: 'I was unable to resolve my permissions in the command invocation channel.'
			});
		}

		const missing = permissions.missing(required);
		return missing.length === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionClientPermissions,
					message: `I am missing the following permissions to run this command: ${missing
						.map((perm) => CorePrecondition.readablePermissions[perm])
						.join(', ')}`,
					context: { missing }
			  });
	}

	public static readonly readablePermissions: Record<PermissionString, string> = {
		ADD_REACTIONS: 'Add Reactions',
		ADMINISTRATOR: 'Administrator',
		ATTACH_FILES: 'Attach Files',
		BAN_MEMBERS: 'Ban Members',
		CHANGE_NICKNAME: 'Change Nickname',
		CONNECT: 'Connect',
		CREATE_INSTANT_INVITE: 'Create Instant Invite',
		CREATE_PRIVATE_THREADS: 'Create Private Threads',
		CREATE_PUBLIC_THREADS: 'Create Public Threads',
		DEAFEN_MEMBERS: 'Deafen Members',
		EMBED_LINKS: 'Embed Links',
		KICK_MEMBERS: 'Kick Members',
		MANAGE_CHANNELS: 'Manage Channels',
		MANAGE_EMOJIS_AND_STICKERS: 'Manage Emojis and Stickers',
		MANAGE_EVENTS: 'Manage Events',
		MANAGE_GUILD: 'Manage Server',
		MANAGE_MESSAGES: 'Manage Messages',
		MANAGE_NICKNAMES: 'Manage Nicknames',
		MANAGE_ROLES: 'Manage Roles',
		MANAGE_THREADS: 'Manage Threads',
		MANAGE_WEBHOOKS: 'Manage Webhooks',
		MENTION_EVERYONE: 'Mention Everyone',
		MODERATE_MEMBERS: 'Moderate Members',
		MOVE_MEMBERS: 'Move Members',
		MUTE_MEMBERS: 'Mute Members',
		PRIORITY_SPEAKER: 'Priority Speaker',
		READ_MESSAGE_HISTORY: 'Read Message History',
		REQUEST_TO_SPEAK: 'Request to Speak',
		SEND_MESSAGES_IN_THREADS: 'Send Messages in Threads',
		SEND_MESSAGES: 'Send Messages',
		SEND_TTS_MESSAGES: 'Send TTS Messages',
		SPEAK: 'Speak',
		START_EMBEDDED_ACTIVITIES: 'Start Activities',
		STREAM: 'Stream',
		USE_APPLICATION_COMMANDS: 'Use Application Commands',
		USE_EXTERNAL_EMOJIS: 'Use External Emojis',
		USE_EXTERNAL_STICKERS: 'Use External Stickers',
		USE_PRIVATE_THREADS: 'Use Private Threads',
		USE_PUBLIC_THREADS: 'Use Public Threads',
		USE_VAD: 'Use Voice Activity',
		VIEW_AUDIT_LOG: 'View Audit Log',
		VIEW_CHANNEL: 'Read Messages',
		VIEW_GUILD_INSIGHTS: 'View Guild Insights'
	};
}
