import { AliasStore } from '@sapphire/pieces';
import { Argument } from './Argument';

export class ArgumentStore extends AliasStore<Argument> {
	public constructor() {
		super(Argument, { name: 'arguments' });
	}
}
