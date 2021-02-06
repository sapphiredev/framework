import type { PermissionResolvable } from 'discord.js';
import type { PreconditionContext } from '../structures/Precondition';
import type { BucketType, PermissionScope, PermissionTarget } from './Enums';

export interface CooldownPreconditionContext extends PreconditionContext {
	/**
	 * The bucket type by which to calculate cooldowns. `bucketType` can either
	 * be global, per-guild, or per-channel; if omitted, the cooldown will be
	 * per-user.
	 */
	bucketType?: BucketType;
	/**
	 * If `limit` is omitted or less than or equal to 1, then this is the
	 * throttle of the bucket, allowing 1 usage per `delay` milliseconds. Otherwise,
	 * the bucket can be hit `limit` times in `delay` milliseconds before being
	 * ratelimited. If omitted, ratelimiting won't be checked.
	 */
	delay?: number;
	/**
	 * The number of times the bucket can be hit before being ratelimited; if omitted,
	 * 1 usage per `delay` milliseconds will be allowed before being ratelimited.
	 */
	limit?: number;
}

export interface PermissionsPreconditionContext extends PreconditionContext {
	/**
	 * The permissions required by the Permissions precondition. Omitting this field
	 * results in a Permissions instance with a bitfield of 0.
	 */
	permissions?: PermissionResolvable;
	/**
	 * The scope at which permissions should be calculated; defaults to per-channel
	 * permissions.
	 */
	scope?: PermissionScope;
	/**
	 * The user whose permissions should be calculated; defaults to the client user.
	 */
	target?: PermissionTarget;
}
