import type { Client } from 'discord.js';
import { BaseStore } from './base/BaseStore';
import { Event } from './Event';

export class EventStore extends BaseStore<Event> {
	public constructor(client: Client) {
		// @ts-expect-error Abstract classes are not assignable to Ctor<T>.
		super(client, Event);
	}
}
