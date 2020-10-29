import { Precondition, PreconditionContext } from '../lib/structures/Precondition';
import { BucketType } from '../lib/types/Enums';
import type { Message } from 'discord.js';
import type { Command } from '../lib/structures/Command';
import { Bucket } from '@sapphire/ratelimits';

interface CooldownOptions {
	delay: number;
	limit: number;
	bucketType: BucketType;
}

export class CorePrecondition extends Precondition {
	public buckets = new WeakMap<Command, Bucket<string>>();

	public run(message: Message, command: Command, context: PreconditionContext) {
		const cooldownOptions: CooldownOptions = {
			delay: (context.delay as number) || 0,
			limit: (context.limit as number) || 0,
			bucketType: (context.bucketType as BucketType) || BucketType.User
		};
		if (cooldownOptions.delay === 0) return this.ok();

		const bucket = this.getBucket(command, cooldownOptions);
		const remaining = bucket.take(this.getID(message, cooldownOptions));

		return remaining === 0 ? this.ok() : this.error(this.name, 'Command ratelimited', { remaining });
	}

	private getID(message: Message, options: CooldownOptions) {
		switch (options.bucketType) {
			case BucketType.Global:
				return this.client.user!.id;
			case BucketType.Channel:
				return message.channel.id;
			case BucketType.User:
				return message.author.id;
			default:
				return message.author.id;
		}
	}

	private getBucket(command: Command, options: CooldownOptions) {
		let bucket = this.buckets.get(command);
		if (!bucket) {
			bucket = new Bucket();
			bucket.setDelay(options.delay);
			if (options.limit !== 0) bucket.setLimit({ timespan: 0, maximum: options.limit });
		}
		return bucket;
	}
}
