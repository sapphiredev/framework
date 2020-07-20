import { Command } from './Command';
import { AliasStore, PieceConstructor, Client } from '@klasa/core';

export class CommandStore extends AliasStore<Command> {
	public constructor(client: Client) {
		super(client, 'commands', Command as PieceConstructor<Command>);
	}
}
