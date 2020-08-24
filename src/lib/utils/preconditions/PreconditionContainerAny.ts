import type { Client, Message } from 'discord.js';
import type { UserError } from '../../errors/UserError';
import type { Command } from '../../structures/Command';
import { isOk, ok, Result } from '../Result';
import type { Awaited } from '../Types';
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

	public run(message: Message, command: Command): Awaited<Result<unknown, UserError>> {
		return this.mode === PreconditionRunMode.Sequential ? this.runSequential(message, command) : this.runParallel(message, command);
	}

	protected async runSequential(message: Message, command: Command): Promise<Result<unknown, UserError>> {
		let error: Result<unknown, UserError> | null = null;
		for (const child of this.entries) {
			const result = await child.run(message, command);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	}

	protected async runParallel(message: Message, command: Command): Promise<Result<unknown, UserError>> {
		const results = await Promise.all(this.entries.map((entry) => entry.run(message, command)));

		let error: Result<unknown, UserError> | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	}

	private static resolveData(data: PreconditionContainerResolvable): [PreconditionRunMode, Entries] {
		if (Array.isArray(data)) return [PreconditionRunMode.Sequential, data];

		const casted = data as PreconditionContainerAnyDetailedData;
		return [casted.mode, casted.entries];
	}
}
