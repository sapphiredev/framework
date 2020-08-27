import type { Client } from 'discord.js';
import { BaseStore } from './base/BaseStore';
import { Precondition } from './Precondition';

export class PreconditionStore extends BaseStore<Precondition> {
	public constructor(client: Client) {
		super(client, Precondition as any, { name: 'preconditions' });
	}
}
