// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import type { Client } from 'discord.js';
import { BaseAliasStore } from './base/BaseAliasStore';
import { Command } from './Command';

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
export class CommandStore extends BaseAliasStore<Command> {
	public constructor(client: Client) {
		// @ts-expect-error Abstract classes are not assignable to Ctor<T>.
		super(client, Command);
	}
}
