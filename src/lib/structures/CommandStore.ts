// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { Command } from './Command';
import { AliasStore } from '@sapphire/pieces';
import type { Client } from 'discord.js';

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
export class CommandStore extends AliasStore<Command> {
	public client: Client;

	public constructor(client: Client) {
		// @ts-expect-error Abstract classes are not assignable to Ctor<T>.
		super(Command);
		this.client = client;
	}
}
