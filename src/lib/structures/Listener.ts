import { Piece, PieceContext, PieceJSON, PieceOptions } from '@sapphire/pieces';
import type { Client, ClientEvents } from 'discord.js';
import type { EventEmitter } from 'events';
import { fromAsync, isErr } from '../parsers/Result';
import { Events } from '../types/Events';

/**
 * The base event class. This class is abstract and is to be extended by subclasses, which should implement the methods. In
 * Sapphire's workflow, listeners are called when the emitter they listen on emits a new message with the same event name.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Events, Listener, PieceContext } from '@sapphire/framework';
 *
 * // Define a class extending `Listener`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreListener extends Listener<typeof Events.Ready> {
 *   public constructor(context: PieceContext) {
 *     super(context, { event: Events.Ready, once: true });
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
 *     super(context, { event: Events.Ready, once: true });
 *   }
 *
 *   run() {
 *     this.container.client.id ??= this.container.client.user?.id ?? null;
 *   }
 * }
 * ```
 */
export abstract class Listener<E extends keyof ClientEvents | symbol = '', O extends ListenerOptions = ListenerOptions> extends Piece<O> {
	/**
	 * The emitter, if any.
	 * @since 2.0.0
	 */
	public readonly emitter: EventEmitter | null;

	/**
	 * The name of the event the listener listens to.
	 * @since 2.0.0
	 */
	public readonly event: string;

	/**
	 * Whether or not the listener will be unloaded after the first run.
	 * @since 2.0.0
	 */
	public readonly once: boolean;

	private _listener: ((...args: any[]) => void) | null;

	public constructor(context: PieceContext, options: ListenerOptions = {}) {
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
		const result = await fromAsync(() => this.run(...args));
		if (isErr(result)) {
			this.container.client.emit(Events.ListenerError, result.error, { piece: this });
		}
	}

	private async _runOnce(...args: unknown[]) {
		await this._run(...args);
		await this.unload();
	}
}

export interface ListenerOptions extends PieceOptions {
	readonly emitter?: keyof Client | EventEmitter;
	readonly event?: string;
	readonly once?: boolean;
}

export interface ListenerJSON extends PieceJSON {
	event: string;
	once: boolean;
}
