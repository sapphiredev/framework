import { Piece } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Client, ClientEvents } from 'discord.js';
import type { EventEmitter } from 'events';
import { Events } from '../types/Events';

/**
 * The base event class. This class is abstract and is to be extended by subclasses, which should implement the methods. In
 * Sapphire's workflow, listeners are called when the emitter they listen on emits a new message with the same event name.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Events, Listener } from '@sapphire/framework';
 *
 * // Define a class extending `Listener`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreListener extends Listener<typeof Events.ClientReady> {
 *   public constructor(context: Listener.Context) {
 *     super(context, { event: Events.ClientReady, once: true });
 *   }
 *
 *   public run() {
 *     this.container.client.id ??= this.container.client.user?.id ?? null;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Events, Listener } = require('@sapphire/framework');
 *
 * // Define a class extending `Listener`, then export it.
 * module.exports = class CoreListener extends Listener {
 *   constructor(context) {
 *     super(context, { event: Events.ClientReady, once: true });
 *   }
 *
 *   run() {
 *     this.container.client.id ??= this.container.client.user?.id ?? null;
 *   }
 * }
 * ```
 */
export abstract class Listener<E extends keyof ClientEvents | symbol = '', O extends Listener.Options = Listener.Options> extends Piece<O> {
	/**
	 * The emitter, if any.
	 * @since 2.0.0
	 */
	public readonly emitter: EventEmitter | null;

	/**
	 * The name of the event the listener listens to.
	 * @since 2.0.0
	 */
	public readonly event: string | symbol;

	/**
	 * Whether or not the listener will be unloaded after the first run.
	 * @since 2.0.0
	 */
	public readonly once: boolean;

	private _listener: ((...args: any[]) => void) | null;

	public constructor(context: Listener.Context, options: O = {} as O) {
		super(context, options);

		this.emitter =
			typeof options.emitter === 'undefined'
				? this.container.client
				: (typeof options.emitter === 'string' ? (Reflect.get(this.container.client, options.emitter) as EventEmitter) : options.emitter) ??
				  null;
		this.event = options.event ?? this.name;
		this.once = options.once ?? false;

		this._listener = this.emitter && this.event ? (this.once ? this._runOnce.bind(this) : this._run.bind(this)) : null;

		// If there's no emitter or no listener, disable:
		if (this.emitter === null || this._listener === null) this.enabled = false;
	}

	public abstract run(...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]): unknown;

	public onLoad() {
		if (this._listener) {
			const emitter = this.emitter!;

			// Increment the maximum amount of listeners by one:
			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners + 1);

			emitter[this.once ? 'once' : 'on'](this.event, this._listener);
		}
		return super.onLoad();
	}

	public onUnload() {
		if (!this.once && this._listener) {
			const emitter = this.emitter!;

			// Increment the maximum amount of listeners by one:
			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners - 1);

			emitter.off(this.event, this._listener);
			this._listener = null;
		}

		return super.onUnload();
	}

	public toJSON(): ListenerJSON {
		return {
			...super.toJSON(),
			once: this.once,
			event: this.event
		};
	}

	private async _run(...args: unknown[]) {
		// @ts-expect-error This seems to be a TS bug, so for now ts-expect-error it
		const result = await Result.fromAsync(() => this.run(...args));
		result.inspectErr((error) => this.container.client.emit(Events.ListenerError, error, { piece: this }));
	}

	private async _runOnce(...args: unknown[]) {
		await this._run(...args);
		await this.unload();
	}
}

export interface ListenerOptions extends Piece.Options {
	readonly emitter?: keyof Client | EventEmitter;
	readonly event?: string | symbol;
	readonly once?: boolean;
}

export interface ListenerJSON extends Piece.JSON {
	event: string | symbol;
	once: boolean;
}

export namespace Listener {
	export type Options = ListenerOptions;
	export type JSON = ListenerJSON;
	export type Context = Piece.Context;
}
