import type { Client } from 'discord.js';
import { Argument } from './Argument';
import { BaseAliasStore } from './base/BaseAliasStore';

export class ArgumentStore extends BaseAliasStore<Argument> {
	public constructor(client: Client) {
		super(client, Argument as any, { name: 'arguments' });
	}
}
