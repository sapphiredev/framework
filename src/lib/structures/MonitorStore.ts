// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { Store, Client, PieceConstructor } from '@klasa/core';
import { Monitor } from './Monitor';

/**
 * Stores all Monitor pieces
 * @since 0.0.1
 */
export class MonitorStore extends Store<Monitor> {
	/**
	 * Constructs the Monitor Store for use
	 * @since 0.0.1
	 * @param client The framework client
	 */
	public constructor(client: Client) {
		super(client, 'monitors', Monitor as PieceConstructor<Monitor>);
	}
}
