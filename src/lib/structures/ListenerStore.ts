import { Store } from '@sapphire/pieces';
import { Listener } from './Listener';
import { ListenerLoaderStrategy } from './ListenerLoaderStrategy';

export class ListenerStore extends Store<Listener, 'listeners'> {
	public constructor() {
		super(Listener, { name: 'listeners', strategy: new ListenerLoaderStrategy() });
	}
}
