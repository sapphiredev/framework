import { CommandInteraction, ContextMenuCommandInteraction, Message, NewsChannel, PermissionsBitField, TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { CorePrecondition as ClientPrecondition, PermissionPreconditionContext } from './ClientPermissions';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly dmChannelPermissions = new PermissionsBitField(
		~new PermissionsBitField([
			'AddReactions',
			'AttachFiles',
			'EmbedLinks',
			'ReadMessageHistory',
			'SendMessages',
			'UseExternalEmojis',
			'ViewChannel',
			'UseExternalStickers',
			'MentionEveryone'
		]).bitfield & PermissionsBitField.All
	).freeze();

	public messageRun(message: Message, _command: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();
		const channel = message.channel as TextChannel | NewsChannel;
		const permissions = message.guild ? channel.permissionsFor(message.author) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'message');
	}

	public chatInputRun(interaction: CommandInteraction, _command: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'chat input');
	}

	public contextMenuRun(interaction: ContextMenuCommandInteraction, _command: Command, context: PermissionPreconditionContext) {
		const required = context.permissions ?? new PermissionsBitField();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'context menu');
	}

	private sharedRun(requiredPermissions: PermissionsBitField, availablePermissions: PermissionsBitField | null, commandType: string) {
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
