import type { Client } from 'discord.js';
import type { Argument } from './Argument';
import { BaseStore } from './base/BaseStore';

export class ArgumentStore extends BaseStore<Argument> {
	public constructor(client: Client) {
		// @ts-expect-error Abstract classes are not assignable to Ctor<T>.
		super(client, Argument);
	}
}
