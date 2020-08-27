import type { Client } from 'discord.js';
import { Argument } from './Argument';
import { BaseStore } from './base/BaseStore';

export class ArgumentStore extends BaseStore<Argument> {
	public constructor(client: Client) {
		super(client, Argument as any, { name: 'arguments' });
	}
}
