import { Bucket } from '@sapphire/ratelimits';
import type { Message } from 'discord.js';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext } from '../lib/structures/Precondition';
import { BucketType } from '../lib/types/Enums';

export interface CooldownContext extends PreconditionContext {
	bucketType?: BucketType;
	delay?: number;
	limit?: number;
}

export class CorePrecondition extends Precondition {
	public buckets = new WeakMap<Command, Bucket<string>>();

	public run(message: Message, command: Command, context: CooldownContext) {
		if (!context.delay || context.delay === 0) return this.ok();

		const bucket = this.getBucket(command, context);
		const remaining = bucket.take(this.getID(message, context));

		return remaining === 0
			? this.ok()
			: this.error({
					message: `You have just used this command. Try again in ${Math.ceil(remaining / 1000)} second${remaining > 1000 ? 's' : ''}.`,
					context: { remaining }
			  });
	}

	private getID(message: Message, context: CooldownContext) {
		switch (context.bucketType) {
			case BucketType.Global:
				return 'global';
			case BucketType.Channel:
				return message.channel.id;
			case BucketType.Guild:
				return message.guild!.id;
			default:
				return message.author.id;
		}
	}

	private getBucket(command: Command, context: CooldownContext) {
		let bucket = this.buckets.get(command);
		if (!bucket) {
			bucket = new Bucket();
			if ((context.limit ?? 1) <= 1) bucket.setDelay(context.delay!);
			else bucket.setLimit({ timespan: context.delay!, maximum: context.limit! });
			this.buckets.set(command, bucket);
		}
		return bucket;
	}
}
