import { container } from '@sapphire/pieces';
import {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	PermissionFlagsBits,
	PermissionsBitField,
	type Message,
	type NewsChannel,
	type TextChannel
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { CorePrecondition as ClientPrecondition, type PermissionPreconditionContext } from './ClientPermissions';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly dmChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			PermissionFlagsBits.AddReactions,
			PermissionFlagsBits.AttachFiles,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ReadMessageHistory,
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.UseExternalEmojis,
			PermissionFlagsBits.ViewChannel,
			PermissionFlagsBits.UseExternalStickers,
			PermissionFlagsBits.MentionEveryone
		]).bitfield & PermissionsBitField.All
	).freeze();

	public messageRun(message: Message, _command: Command, context: PermissionPreconditionContext): AllFlowsPrecondition.Result {
		const required = context.permissions ?? new PermissionsBitField();
		const channel = message.channel as TextChannel | NewsChannel;
		const permissions = message.guild ? channel.permissionsFor(message.author) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'message');
	}

	public chatInputRun(
		interaction: ChatInputCommandInteraction,
		_command: Command,
		context: PermissionPreconditionContext
	): AllFlowsPrecondition.Result {
		const required = context.permissions ?? new PermissionsBitField();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'chat input');
	}

	public contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		_command: Command,
		context: PermissionPreconditionContext
	): AllFlowsPrecondition.Result {
		const required = context.permissions ?? new PermissionsBitField();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'context menu');
	}

	private sharedRun(
		requiredPermissions: PermissionsBitField,
		availablePermissions: PermissionsBitField | null,
		commandType: string
	): AllFlowsPrecondition.Result {
		if (!availablePermissions) {
			return this.error({
				identifier: Identifiers.PreconditionUserPermissionsNoPermissions,
				message: `I was unable to resolve the end-user's permissions in the ${commandType} command invocation channel.`
			});
		}

		const missing = availablePermissions.missing(requiredPermissions);
		return missing.length === 0
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionUserPermissions,
					message: `You are missing the following permissions to run this command: ${missing
						.map((perm) => ClientPrecondition.readablePermissions[perm])
						.join(', ')}`,
					context: { missing }
			  });
	}
}

void container.stores.loadPiece({
	name: 'UserPermissions',
	piece: CorePrecondition,
	store: 'preconditions'
});
