import { Store } from '@sapphire/pieces';
import type { Client } from 'discord.js';
import { Precondition } from './Precondition';

export class PreconditionStore extends Store<Precondition> {
	public client: Client;

	public constructor(client: Client) {
		// @ts-expect-error Abstract classes are not assignable to Ctor<T>.
		super(Precondition);
		this.client = client;
	}
}
