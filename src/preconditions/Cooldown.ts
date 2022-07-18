import { RateLimitManager } from '@sapphire/ratelimits';
import type { BaseInteraction, CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition, PreconditionContext } from '../lib/structures/Precondition';
import { BucketScope } from '../lib/types/Enums';

export interface CooldownPreconditionContext extends PreconditionContext {
	scope?: BucketScope;
	delay: number;
	limit?: number;
	filteredUsers?: Snowflake[];
}

export class CorePrecondition extends AllFlowsPrecondition {
	public buckets = new WeakMap<Command, RateLimitManager<string>>();

	public messageRun(message: Message, command: Command, context: CooldownPreconditionContext) {
		const cooldownId = this.getIdFromMessage(message, context);

		return this.sharedRun(message.author.id, command, context, cooldownId, 'message');
	}

	public chatInputRun(interaction: CommandInteraction, command: Command, context: CooldownPreconditionContext) {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId ?? 'global', 'chat input');
	}

	public contextMenuRun(interaction: ContextMenuCommandInteraction, command: Command, context: CooldownPreconditionContext) {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId ?? 'global', 'context menu');
	}

	private sharedRun(authorId: string, command: Command, context: CooldownPreconditionContext, cooldownId: string, commandType: string) {
		// If the command it is testing for is not this one, return ok:
		if (context.external) return this.ok();

		// If there is no delay (undefined, null, 0), return ok:
		if (!context.delay) return this.ok();

		// If the user has provided any filtered users and the authorId is in that array, return ok:
		if (context.filteredUsers?.includes(authorId)) return this.ok();

		const ratelimit = this.getManager(command, context).acquire(cooldownId);

		if (ratelimit.limited) {
			const remaining = ratelimit.remainingTime;

			return this.error({
				identifier: Identifiers.PreconditionCooldown,
				message: `There is a cooldown in effect for this ${commandType} command. It'll be available at ${new Date(
					ratelimit.expires
				).toISOString()}.`,
				context: { remaining }
			});
		}

		ratelimit.consume();
		return this.ok();
	}

	private getIdFromMessage(message: Message, context: CooldownPreconditionContext) {
		switch (context.scope) {
			case BucketScope.Global:
				return 'global';
			case BucketScope.Channel:
				return message.channel.id;
			case BucketScope.Guild:
				return message.guild?.id ?? message.channel.id;
			default:
				return message.author.id;
		}
	}

	private getIdFromInteraction(interaction: BaseInteraction, context: CooldownPreconditionContext) {
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
