import { RateLimitManager } from '@sapphire/ratelimits';
import type { Message, Snowflake } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext } from '../lib/structures/Precondition';
import { BucketScope } from '../lib/types/Enums';

export interface CooldownContext extends PreconditionContext {
	scope?: BucketScope;
	delay: number;
	limit?: number;
	filteredUsers?: Snowflake[];
}

export class CorePrecondition extends Precondition {
	public buckets = new WeakMap<Command, RateLimitManager<string>>();

	public run(message: Message, command: Command, context: CooldownContext) {
		// If the command it is testing for is not this one, return ok:
		if (context.external) return this.ok();

		// If there is no delay (undefined, null, 0), return ok:
		if (!context.delay) return this.ok();

		// If the user has provided any filtered users and the message author is in that array, return ok:
		if (context.filteredUsers?.includes(message.author.id)) return this.ok();

		const ratelimit = this.getManager(command, context).acquire(this.getId(message, context));
		if (ratelimit.limited) {
			const remaining = ratelimit.remainingTime;
			return this.error({
				identifier: Identifiers.PreconditionCooldown,
				message: `There is a cooldown in effect for this command. It can be used again in ${Math.ceil(remaining / 1000)} second${
					remaining > 1000 ? 's' : ''
				}.`,
				context: { remaining }
			});
		}

		ratelimit.consume();
		return this.ok();
	}

	private getId(message: Message, context: CooldownContext) {
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

	private getManager(command: Command, context: CooldownContext) {
		let manager = this.buckets.get(command);
		if (!manager) {
			manager = new RateLimitManager(context.delay, context.limit);
			this.buckets.set(command, manager);
		}
		return manager;
	}
}
