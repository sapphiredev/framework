import { Store } from '@sapphire/pieces';
import { Listener } from './Listener';

export class ListenerStore extends Store<Listener, 'listeners'> {
	public constructor() {
		super(Listener, { name: 'listeners' });
	}
}
