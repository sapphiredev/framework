import type { Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { PreconditionContext } from '../../structures/Precondition';
import type { IPreconditionContainer } from './IPreconditionContainer';

export interface PreconditionSingleResolvableDetails {
	entry: string;
	context: PreconditionContext;
}
export type PreconditionSingleResolvable = string | PreconditionSingleResolvableDetails;

export class PreconditionContainerSingle implements IPreconditionContainer {
	public readonly context: PreconditionContext;
	public readonly entry: string;

	public constructor(data: PreconditionSingleResolvable) {
		if (typeof data === 'string') {
			this.context = {};
			this.entry = data;
		} else {
			this.context = data.context;
			this.entry = data.entry;
		}
	}

	public run(message: Message, command: Command) {
		const precondition = message.client.preconditions.get(this.entry);
		if (precondition) return precondition.run(message, command, this.context);
		throw new Error(`The precondition ${this.entry} is not available.`);
	}
}
