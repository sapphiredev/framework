// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { AliasStore, Client, PieceConstructor } from '@klasa/core';
import { Command } from './Command';

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
