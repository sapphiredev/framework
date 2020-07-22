// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { Command } from './Command';
import { AliasStore, PieceConstructor, Client } from '@klasa/core';

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
export class CommandStore extends AliasStore<Command> {
	/**
	 * Constructs the Command Store for use
	 * @since 1.0.0
	 * @param client The framework client
	 */
	public constructor(client: Client) {
		super(client, 'commands', Command as PieceConstructor<Command>);
	}
}
