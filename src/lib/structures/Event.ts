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

		this.emitter = (typeof options.emitter === 'string' ? ((this.client[options.emitter] as unknown) as EventEmitter) : options.emitter) ?? null;
		this.event = options.event ?? '';
		this.once = options.once ?? false;

		this.#listener = this.emitter && this.event ? (this.once ? this._runOnce.bind(this) : this._run.bind(this)) : null;
	}

	public abstract run(...args: E extends keyof ClientEvents ? ClientEvents[E] : any[]): unknown;

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

	private async _run(...args: any[]) {
		try {
			// @ts-expect-error Argument of type 'any[]' is not assignable to parameter of type 'E extends string | number ? ClientEvents[E] : any[]'. (2345)
			await this.run(...args);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	private async _runOnce(...args: any[]) {
		await this._run(...args);
		await this.store.unload(this);
	}
}

export interface EventOptions extends PieceOptions {
	readonly emitter?: keyof Client | EventEmitter;
	readonly event?: string;
	readonly once?: boolean;
}
