import { container } from '@sapphire/pieces';
import { RateLimitManager } from '@sapphire/ratelimits';
import {
	TimestampStyles,
	time,
	type ChatInputCommandInteraction,
	type CommandInteraction,
	type ContextMenuCommandInteraction,
	type Message,
	type Snowflake
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { BucketScope } from '../lib/types/Enums';

export interface CooldownPreconditionContext extends AllFlowsPrecondition.Context {
	scope?: BucketScope;
	delay: number;
	limit?: number;
	filteredUsers?: Snowflake[];
}

export class CorePrecondition extends AllFlowsPrecondition {
	public buckets: WeakMap<Command, RateLimitManager<string>> = new WeakMap<Command, RateLimitManager<string>>();

	public messageRun(message: Message, command: Command, context: CooldownPreconditionContext): AllFlowsPrecondition.Result {
		const cooldownId = this.getIdFromMessage(message, context);

		return this.sharedRun(message.author.id, command, context, cooldownId, 'message');
	}

	public chatInputRun(
		interaction: ChatInputCommandInteraction,
		command: Command,
		context: CooldownPreconditionContext
	): AllFlowsPrecondition.Result {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId, 'chat input');
	}

	public contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		command: Command,
		context: CooldownPreconditionContext
	): AllFlowsPrecondition.Result {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId, 'context menu');
	}

	private sharedRun(
		authorId: string,
		command: Command,
		context: CooldownPreconditionContext,
		cooldownId: string,
		commandType: string
	): AllFlowsPrecondition.Result {
		// If the command it is testing for is not this one, return ok:
		if (context.external) return this.ok();

		// If there is no delay (undefined, null, 0), return ok:
		if (!context.delay) return this.ok();

		// If the user has provided any filtered users and the authorId is in that array, return ok:
		if (context.filteredUsers?.includes(authorId)) return this.ok();

		const rateLimit = this.getManager(command, context).acquire(cooldownId);

		if (rateLimit.limited) {
			const remaining = rateLimit.remainingTime;
			const nextAvailable = time(Math.floor(rateLimit.expires / 1000), TimestampStyles.RelativeTime);

			return this.error({
				identifier: Identifiers.PreconditionCooldown,
				message: `There is a cooldown in effect for this ${commandType} command. It'll be available ${nextAvailable}.`,
				context: { remaining }
			});
		}

		rateLimit.consume();
		return this.ok();
	}

	private getIdFromMessage(message: Message, context: CooldownPreconditionContext) {
		switch (context.scope) {
			case BucketScope.Global:
				return 'global';
			case BucketScope.Channel:
				return message.channelId;
			case BucketScope.Guild:
				return message.guildId ?? message.channelId;
			default:
				return message.author.id;
		}
	}

	private getIdFromInteraction(interaction: CommandInteraction, context: CooldownPreconditionContext) {
		switch (context.scope) {
			case BucketScope.Global:
				return 'global';
			case BucketScope.Channel:
				return interaction.channelId;
			case BucketScope.Guild:
				return interaction.guildId ?? interaction.channelId;
			default:
				return interaction.user.id;
		}
	}

	private getManager(command: Command, context: CooldownPreconditionContext) {
		let manager = this.buckets.get(command);
		if (!manager) {
			manager = new RateLimitManager(context.delay, context.limit);
			this.buckets.set(command, manager);
		}
		return manager;
	}
}

void container.stores.loadPiece({
	name: 'Cooldown',
	piece: CorePrecondition,
	store: 'preconditions'
});
