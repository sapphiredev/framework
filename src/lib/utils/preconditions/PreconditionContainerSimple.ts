import type { Client, Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { Precondition, PreconditionContext } from '../../structures/Precondition';
import type { IPreconditionContainer } from './IPreconditionContainer';

export interface PreconditionContainerSingleEntry {
	entry: string;
	context: PreconditionContext;
}
export type PreconditionContainerSingleResolvable = string | PreconditionContainerSingleEntry;

export class PreconditionContainerSingle implements IPreconditionContainer {
	public readonly client: Client;
	public readonly context: PreconditionContext;
	public readonly entry: string;

	public constructor(client: Client, data: PreconditionContainerSingleResolvable) {
		this.client = client;

		if (typeof data === 'string') {
			this.context = {};
			this.entry = data;
		} else {
			this.context = data.context;
			this.entry = data.entry;
		}
	}

	public get precondition(): Precondition {
		const precondition = this.client.preconditions.get(this.entry);
		if (precondition) return precondition;
		throw new Error(`The precondition ${this.entry} is not available.`);
	}

	public run(message: Message, command: Command) {
		return this.precondition.run(message, command, this.context);
	}
}
