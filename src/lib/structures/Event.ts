import type { PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Client, ClientEvents } from 'discord.js';
import type { EventEmitter } from 'events';
import { Events } from '../types/Events';
import { BasePiece } from './base/BasePiece';

export abstract class Event<E extends keyof ClientEvents | symbol = ''> extends BasePiece {
	public readonly emitter: EventEmitter | null;
	public readonly event: string;
	public readonly once: boolean;

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#listener: ((...args: any[]) => void) | null;

	public constructor(context: PieceContext, options: EventOptions = {}) {
		super(context, options);

		this.emitter =
			typeof options.emitter === 'undefined'
				? this.client
				: (typeof options.emitter === 'string' ? (Reflect.get(this.client, options.emitter) as EventEmitter) : options.emitter) ?? null;
		this.event = options.event ?? '';
		this.once = options.once ?? false;

		this.#listener = this.emitter && this.event ? (this.once ? this._runOnce.bind(this) : this._run.bind(this)) : null;
	}

	public abstract run(...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]): unknown;

	public onLoad() {
		if (this.#listener) this.emitter![this.once ? 'once' : 'on'](this.event, this.#listener);
	}

	public onUnload() {
		if (!this.once && this.#listener) this.emitter!.off(this.event, this.#listener);
	}

	public toJSON(): Record<PropertyKey, unknown> {
		return {
			...super.toJSON(),
			event: this.event
		};
	}

	private async _run(...args: unknown[]) {
		try {
			// @ts-expect-error Argument of type 'unknown[]' is not assignable to parameter of type 'E extends string | number ? ClientEvents[E] : unknown[]'. (2345)
			await this.run(...args);
		} catch (error) {
			this.client.emit(Events.EventError, error, { piece: this });
		}
	}

	private async _runOnce(...args: unknown[]) {
		await this._run(...args);
		await this.store.unload(this);
	}
}

export interface EventOptions extends PieceOptions {
	readonly emitter?: keyof Client | EventEmitter;
	readonly event?: string;
	readonly once?: boolean;
}
