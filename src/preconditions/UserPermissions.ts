import { CommandInteraction, ContextMenuInteraction, Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command, CommandOptions } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { CorePrecondition as ClientPrecondition, UserPermissionsPreconditionContext } from './ClientPermissions';

export class CorePrecondition extends AllFlowsPrecondition {
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

	public parseCommandOptions(options: CommandOptions): UserPermissionsPreconditionContext | null {
		const permissions = new Permissions(options.requiredUserPermissions);

		if (permissions.bitfield === 0n) return null;

		return { permissions };
	}

	public messageRun(message: Message, _command: Command, context: UserPermissionsPreconditionContext) {
		const required = context.permissions ?? new Permissions();
		const channel = message.channel as TextChannel | NewsChannel;
		const permissions = message.guild ? channel.permissionsFor(message.author) : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'message');
	}

	public chatInputRun(interaction: CommandInteraction, _command: Command, context: UserPermissionsPreconditionContext) {
		const required = context.permissions ?? new Permissions();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'chat input');
	}

	public contextMenuRun(interaction: ContextMenuInteraction, _command: Command, context: UserPermissionsPreconditionContext) {
		const required = context.permissions ?? new Permissions();
		const permissions = interaction.guildId ? interaction.memberPermissions : this.dmChannelPermissions;

		return this.sharedRun(required, permissions, 'context menu');
	}

	private sharedRun(requiredPermissions: Permissions, availablePermissions: Permissions | null, commandType: string) {
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
