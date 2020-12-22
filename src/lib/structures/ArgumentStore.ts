import { AliasStore } from '@sapphire/pieces';
import { Argument } from './Argument';

export class ArgumentStore extends AliasStore<Argument> {
	public constructor() {
		super(Argument as any, { name: 'arguments' });
	}
}
