import type { Client } from 'discord.js';
import { BaseStore } from './base/BaseStore';
import { Event } from './Event';

export class EventStore extends BaseStore<Event> {
	public constructor(client: Client) {
		super(client, Event as any, { name: 'events' });
	}
}
