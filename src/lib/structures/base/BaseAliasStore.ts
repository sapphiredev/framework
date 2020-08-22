import { AliasStore, PieceContextExtras } from '@sapphire/pieces';
import type { Client } from 'discord.js';
import type { BaseAliasPiece } from './BaseAliasPiece';

declare type Constructor<T> = new (...args: any[]) => T;

export class BaseAliasStore<T extends BaseAliasPiece> extends AliasStore<T> {
	public readonly client: Client;

	public constructor(client: Client, Ctor: Constructor<T>) {
		super(Ctor, {
			onError: (error) => client.emit('error', error),
			onUnload: (store, piece) => client.emit('unload', store, piece),
			onPostLoad: (store, piece) => client.emit('postLoad', store, piece)
		});
		this.client = client;
	}

	protected get extras(): PieceContextExtras {
		return { ...super.extras, client: this.client };
	}
}
