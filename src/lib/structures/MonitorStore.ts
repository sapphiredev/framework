import { Store, Client, PieceConstructor } from '@klasa/core';
import { Monitor } from '../structures/Monitor';

export class MonitorStore extends Store<Monitor> {
	public constructor(client: Client) {
		super(client, 'monitors', Monitor as PieceConstructor<Monitor>);
	}
}
