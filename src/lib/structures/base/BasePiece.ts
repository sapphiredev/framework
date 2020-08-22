import { Piece } from '@sapphire/pieces';
import type { Client } from 'discord.js';

export class BasePiece extends Piece {
	public get client(): Client {
		return this.extras.client as Client;
	}
}
