import { Store } from '@sapphire/pieces';
import { Event } from './Event';

export class EventStore extends Store<Event> {
	public constructor() {
		super(Event as any, { name: 'events' });
	}
}
