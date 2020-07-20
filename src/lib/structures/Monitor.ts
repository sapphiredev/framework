import { Piece, PieceOptions, Message } from '@klasa/core';
import type { MonitorStore } from '../stores/MonitorStore';

export abstract class Monitor extends Piece {
	/**
	 * Should this monitor ignore bots
	 * @default false
	 */
	public ignoreBots = false;

	/**
	 * Should this monitor ignore messages sent by the bot itself
	 * @default false
	 */
	public ignoreSelf = false;

	/**
	 * Should this monitor ignore everyone except itself
	 * @default false
	 */
	public ignoreOthers = false;

	/**
	 * Should this monitor ignore webhook messages
	 * @default false
	 */
	public ignoreWebhooks = false;

	/**
	 * Should this monitor ignore message edits
	 * @default false
	 */
	public ignoreEdits = false;

	public constructor(store: MonitorStore, directory: string, file: string[], options: PieceOptions) {
		super(store, directory, file, options);
	}

	public abstract async handle(message: Message): Promise<unknown>;

	public async run(message: Message) {
		if (
			!this.enabled
			|| (this.ignoreBots && message.author.bot)
			|| (this.ignoreSelf && this.client.user === message.author)
			|| (this.ignoreOthers && this.client.user !== message.author)
			|| (this.ignoreWebhooks && message.webhookID)
			|| (this.ignoreEdits && message.editedTimestamp)
		) { return; }

		try {
			await this.handle(message);
		} catch (error) {
			// TODO: Change this into an enum
			this.client.emit('MonitorError', message, error, this);
		}
	}
}
