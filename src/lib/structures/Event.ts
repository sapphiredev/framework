import type { PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Client } from 'discord.js';
import type { EventEmitter } from 'events';
import { BasePiece } from './base/BasePiece';

export abstract class Event extends BasePiece {
	public readonly emitter: EventEmitter | null;
	public readonly event: string;

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	readonly #listener: ((...args: any[]) => void) | null;

	public constructor(context: PieceContext, options: EventOptions = {}) {
		super(context, options);

		this.emitter = (typeof options.emitter === 'string' ? ((this.client[options.emitter] as unknown) as EventEmitter) : options.emitter) ?? null;
		this.event = options.event ?? '';
		this.#listener = this.emitter && this.event ? this.run.bind(this) : null;
	}

	public abstract run(...args: readonly any[]): unknown;

	public onLoad() {
		if (this.#listener) this.emitter!.on(this.event, this.#listener);
	}

	public onUnload() {
		if (this.#listener) this.emitter!.off(this.event, this.#listener);
	}

	public toJSON(): Record<PropertyKey, unknown> {
		return {
			...super.toJSON(),
			event: this.event
		};
	}
}

export interface EventOptions extends PieceOptions {
	emitter?: keyof Client | EventEmitter;
	event?: string;
}
