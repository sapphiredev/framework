import { RateLimitManager } from '@sapphire/ratelimits';
import type { BaseCommandInteraction, CommandInteraction, ContextMenuInteraction, Message, Snowflake } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command, CommandOptions } from '../lib/structures/Command';
import { AllFlowsPrecondition, PreconditionContext } from '../lib/structures/Precondition';
import { BucketScope } from '../lib/types/Enums';

export interface CooldownContext extends PreconditionContext {
	scope?: BucketScope;
	delay: number;
	limit?: number;
	filteredUsers?: Snowflake[];
}

export class CorePrecondition extends AllFlowsPrecondition {
	public buckets = new WeakMap<Command, RateLimitManager<string>>();

  public parseCommandOptions(options: CommandOptions): CooldownContext | null {
		const { defaultCooldown } = this.container.client.options;

		// We will check for whether the command is filtered from the defaults, but we will allow overridden values to
		// be set. If an overridden value is passed, it will have priority. Otherwise it will default to 0 if filtered
		// (causing the precondition to not be registered) or the default value with a fallback to a single-use cooldown.
		const filtered = defaultCooldown?.filteredCommands?.includes(this.name) ?? false;
		const limit = options.cooldownLimit ?? (filtered ? 0 : defaultCooldown?.limit ?? 1);
		const delay = options.cooldownDelay ?? (filtered ? 0 : defaultCooldown?.delay ?? 0);

    if (!limit || !delay) return null

		const scope = options.cooldownScope ?? defaultCooldown?.scope ?? BucketScope.User;
		const filteredUsers = options.cooldownFilteredUsers ?? defaultCooldown?.filteredUsers;

		return { scope, limit, delay, filteredUsers }
  }

	public messageRun(message: Message, command: Command, context: CooldownContext) {
		const cooldownId = this.getIdFromMessage(message, context);

		return this.sharedRun(message.author.id, command, context, cooldownId, 'message');
	}

	public chatInputRun(interaction: CommandInteraction, command: Command, context: CooldownContext) {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId, 'chat input');
	}

	public contextMenuRun(interaction: ContextMenuInteraction, command: Command, context: CooldownContext) {
		const cooldownId = this.getIdFromInteraction(interaction, context);

		return this.sharedRun(interaction.user.id, command, context, cooldownId, 'context menu');
	}

	private sharedRun(authorId: string, command: Command, context: CooldownContext, cooldownId: string, commandType: string) {
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
				// TODO(vladfrangu): maybe use the `ms` package instead
				message: `There is a cooldown in effect for this ${commandType} command. It can be used again in ${Math.ceil(
					remaining / 1000
				)} second${remaining > 1000 ? 's' : ''}.`,
				context: { remaining }
			});
		}

		ratelimit.consume();
		return this.ok();
	}

	private getIdFromMessage(message: Message, context: CooldownContext) {
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

	private getIdFromInteraction(interaction: BaseCommandInteraction, context: CooldownContext) {
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

	private getManager(command: Command, context: CooldownContext) {
		let manager = this.buckets.get(command);
		if (!manager) {
			manager = new RateLimitManager(context.delay, context.limit);
			this.buckets.set(command, manager);
		}
		return manager;
	}
}
