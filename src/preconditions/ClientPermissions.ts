import { isNullish } from '@sapphire/utilities';
import {
	BaseInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	PermissionFlagsBits,
	PermissionsBitField,
	PermissionsString,
	TextBasedChannel,
	type Message
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export interface PermissionPreconditionContext extends AllFlowsPrecondition.Context {
	permissions?: PermissionsBitField;
}

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly dmChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			//
			PermissionFlagsBits.AddReactions,
			PermissionFlagsBits.AttachFiles,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ReadMessageHistory,
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.UseExternalEmojis,
			PermissionFlagsBits.ViewChannel
		]).bitfield & PermissionsBitField.All
	).freeze();

	public async messageRun(message: Message, _: Command, context: PermissionPreconditionContext): AllFlowsPrecondition.AsyncResult {
		const required = context.permissions ?? new PermissionsBitField();
		const { channel } = message;

		if (!message.client.id) {
			return this.error({
				identifier: Identifiers.PreconditionClientPermissionsNoClient,
				message: 'There was no client to validate the permissions for.'
			});
		}

		const permissions = await this.getPermissionsForChannel(channel, message);

		return this.sharedRun(required, permissions, 'message');
	}

	public async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: Command,
		context: PermissionPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		const required = context.permissions ?? new PermissionsBitField();

		const channel = await this.fetchChannelFromInteraction(interaction);

		const permissions = await this.getPermissionsForChannel(channel, interaction);

		return this.sharedRun(required, permissions, 'chat input');
	}

	public async contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		_: Command,
		context: PermissionPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		const required = context.permissions ?? new PermissionsBitField();

		const channel = await this.fetchChannelFromInteraction(interaction);

		const permissions = await this.getPermissionsForChannel(channel, interaction);

		return this.sharedRun(required, permissions, 'context menu');
	}

	private async getPermissionsForChannel(channel: TextBasedChannel, messageOrInteraction: Message | BaseInteraction) {
		let permissions: PermissionsBitField | null = this.dmChannelPermissions;

		if (messageOrInteraction.inGuild() && !channel.isDMBased()) {
			if (!isNullish(messageOrInteraction.applicationId)) {
				permissions = channel.permissionsFor(messageOrInteraction.applicationId);
			}

			if (isNullish(permissions)) {
				const me = await messageOrInteraction.guild?.members.fetchMe();
				if (me) {
					permissions = channel.permissionsFor(me);
				}
			}
		}

		return permissions;
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
