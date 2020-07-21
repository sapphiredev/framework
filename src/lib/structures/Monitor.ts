// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { Piece, PieceOptions, Message } from '@klasa/core';
import type { MonitorStore } from './MonitorStore';

export abstract class Monitor extends Piece {
	public constructor(store: MonitorStore, directory: string, file: string[], options: PieceOptions) {
		super(store, directory, file, options);
	}

	public abstract async handle(message: Message): Promise<unknown>;

	public async run(message: Message) {
		if (
			!this.enabled ||
			(this.ignoreBots && message.author.bot) ||
			(this.ignoreBots && !message.author.bot) ||
			(this.ignoreSelf && this.client.user === message.author) ||
			(this.ignoreOthers && this.client.user !== message.author) ||
			(this.ignoreWebhooks && message.webhookID) ||
			(this.ignoreEdits && message.editedTimestamp)
		) {
			return;
		}

		try {
			await this.handle(message);
		} catch (error) {
			// TODO: Change this into an enum
			this.client.emit('monitorError', message, error, this);
		}
	}
}

/**
 * The Interface defining all ignore groups.
 * @since 1.0.0
 */
export interface Monitor {
	/**
	 * Should this monitor ignore bots
	 * @since 1.0.0
	 * @public
	 */
	ignoreBots: boolean;

	/**
	 * Should this monitor ignore users
	 * @since 1.0.0
	 * @public
	 */
	ignoreUsers: boolean;

	/**
	 * Should this monitor ignore messages sent by the bot itself
	 * @since 1.0.0
	 * @public
	 */
	ignoreSelf: boolean;

	/**
	 * Should this monitor ignore everyone except itself
	 * @since 1.0.0
	 * @public
	 */
	ignoreOthers: boolean;

	/**
	 * Should this monitor ignore webhook messages
	 * @since 1.0.0
	 * @public
	 */
	ignoreWebhooks: boolean;

	/**
	 * Should this monitor ignore message edits
	 * @since 1.0.0
	 * @public
	 */
	ignoreEdits: boolean;
}
