import { AliasStore } from '@sapphire/pieces';
import { Argument } from './Argument';

export class ArgumentStore extends AliasStore<Argument, 'arguments'> {
	public constructor() {
		super(Argument, { name: 'arguments' });
	}
}
