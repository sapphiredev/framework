import {
	BaseGuildTextChannel,
	CommandInteraction,
	ContextMenuCommandInteraction,
	GuildTextBasedChannel,
	Message,
	PermissionsBitField,
	PermissionsString
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition, PreconditionContext } from '../lib/structures/Precondition';

export interface PermissionPreconditionContext extends PreconditionContext {
	permissions?: PermissionsBitField;
}

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly dmChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			//
			'AddReactions',
			'AttachFiles',
			'EmbedLinks',
			'ReadMessageHistory',
			'SendMessages',
			'UseExternalEmojis',
			'ViewChannel'
		]).bitfield & PermissionsBitField.All
	).freeze();

	public messageRun(message: Message, _: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();
		const channel = message.channel as BaseGuildTextChannel;

		if (!message.client.id) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoClient,
				message: 'There was no client to validate the permissions for.'
			});
		}

		const permissions = message.guild ? channel.permissionsFor(message.client.id) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'message');
	}

	public async chatInputRun(interaction: CommandInteraction, _: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();

		const channel = (await this.fetchChannelFromInteraction(interaction)) as GuildTextBasedChannel;

		const permissions = interaction.inGuild() ? channel.permissionsFor(interaction.applicationId) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'chat input');
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction, _: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();
		const channel = (await this.fetchChannelFromInteraction(interaction)) as GuildTextBasedChannel;

		const permissions = interaction.inGuild() ? channel.permissionsFor(interaction.applicationId) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'context menu');
	}

	private sharedRun(requiredPermissions: PermissionsBitField, availablePermissions: PermissionsBitField | null, commandType: string) {
		if (!availablePermissions) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoPermissions,
				message: `I was unable to resolve my permissions in the ${commandType} command invocation channel.`
			});
		}

		const missing = availablePermissions.missing(requiredPermissions);
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

	public static readonly readablePermissions: Record<PermissionsString, string> = {
		AddReactions: 'Add Reactions',
		Administrator: 'Administrator',
		AttachFiles: 'Attach Files',
		BanMembers: 'Ban Members',
		ChangeNickname: 'Change Nickname',
		Connect: 'Connect',
		CreateInstantInvite: 'Create Instant Invite',
		CreatePrivateThreads: 'Create Private Threads',
		CreatePublicThreads: 'Create Public Threads',
		DeafenMembers: 'Deafen Members',
		EmbedLinks: 'Embed Links',
		KickMembers: 'Kick Members',
		ManageChannels: 'Manage Channels',
		ManageEmojisAndStickers: 'Manage Emojis and Stickers',
		ManageEvents: 'Manage Events',
		ManageGuild: 'Manage Server',
		ManageMessages: 'Manage Messages',
		ManageNicknames: 'Manage Nicknames',
		ManageRoles: 'Manage Roles',
		ManageThreads: 'Manage Threads',
		ManageWebhooks: 'Manage Webhooks',
		MentionEveryone: 'Mention Everyone',
		ModerateMembers: 'Moderate Members',
		MoveMembers: 'Move Members',
		MuteMembers: 'Mute Members',
		PrioritySpeaker: 'Priority Speaker',
		ReadMessageHistory: 'Read Message History',
		RequestToSpeak: 'Request to Speak',
		SendMessagesInThreads: 'Send Messages in Threads',
		SendMessages: 'Send Messages',
		SendTTSMessages: 'Send TTS Messages',
		Speak: 'Speak',
		UseEmbeddedActivities: 'Start Activities',
		Stream: 'Stream',
		UseApplicationCommands: 'Use Application Commands',
		UseExternalEmojis: 'Use External Emojis',
		UseExternalStickers: 'Use External Stickers',
		UseVAD: 'Use Voice Activity',
		ViewAuditLog: 'View Audit Log',
		ViewChannel: 'Read Messages',
		ViewGuildInsights: 'View Guild Insights'
	};
}
