import type { Client, Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { IPreconditionContainer } from './IPreconditionContainer';
import { PreconditionContainerSingle, PreconditionContainerSingleResolvable } from './PreconditionContainerSimple';

const enum PreconditionRunMode {
	Sequential = 'sequential',
	Parallel = 'parallel'
}

interface PreconditionContainerAnyDetailedData {
	entries: Entries;
	mode: PreconditionRunMode;
}
type Entry = PreconditionContainerSingleResolvable | PreconditionContainerResolvable;
type Entries = readonly Entry[];
export type PreconditionContainerResolvable = Entries | PreconditionContainerAnyDetailedData;

function isSingle(entry: Entry): entry is PreconditionContainerSingleResolvable {
	return typeof entry === 'string' || Reflect.has(entry, 'entry');
}

export class PreconditionContainerAny implements IPreconditionContainer {
	public entries: IPreconditionContainer[];
	public mode: PreconditionRunMode;

	public constructor(client: Client, data: PreconditionContainerResolvable) {
		this.entries = [];

		const [mode, entries] = PreconditionContainerAny.resolveData(data);
		this.mode = mode;
		for (const entry of entries) {
			this.entries.push(isSingle(entry) ? new PreconditionContainerSingle(client, entry) : new PreconditionContainerAny(client, entry));
		}
	}

	public async run(message: Message, command: Command) {
		return this.mode === PreconditionRunMode.Sequential ? this.runSequential(message, command) : this.runParallel(message, command);
	}

	protected async runSequential(message: Message, command: Command) {
		for (const child of this.entries) {
			if (await child.run(message, command)) return true;
		}

		return false;
	}

	protected async runParallel(message: Message, command: Command) {
		const results = await Promise.all(this.entries.map((entry) => entry.run(message, command)));
		return results.some((result) => result);
	}

	private static resolveData(data: PreconditionContainerResolvable): [PreconditionRunMode, Entries] {
		if (Array.isArray(data)) return [PreconditionRunMode.Sequential, data];

		const casted = data as PreconditionContainerAnyDetailedData;
		return [casted.mode, casted.entries];
	}
}
