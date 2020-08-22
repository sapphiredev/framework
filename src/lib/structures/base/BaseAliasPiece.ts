import { AliasPiece } from '@sapphire/pieces';
import type { Client } from 'discord.js';

export class BaseAliasPiece extends AliasPiece {
	public get client(): Client {
		return this.extras.client as Client;
	}
}
