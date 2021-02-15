import { Store } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { ok } from '../parsers/Result';
import type { Command } from './Command';
import { AsyncPreconditionResult, Precondition, PreconditionContext } from './Precondition';

export class PreconditionStore extends Store<Precondition> {
	private readonly globalPreconditions: Precondition[] = [];

	public constructor() {
		super(Precondition as any, { name: 'preconditions' });
	}

	public async run(message: Message, command: Command, context: PreconditionContext = {}): AsyncPreconditionResult {
		for (const precondition of this.globalPreconditions) {
			const result = await precondition.run(message, command, context);
			if (!result.success) return result;
		}

		return ok();
	}

	public set(key: string, value: Precondition): this {
		if (value.position !== null) {
			const index = this.globalPreconditions.findIndex((precondition) => precondition.position! >= value.position!);

			// If a middleware with lower priority wasn't found, push to the end of the array
			if (index === -1) this.globalPreconditions.push(value);
			else this.globalPreconditions.splice(index, 0, value);
		}

		return super.set(key, value);
	}

	public delete(key: string): boolean {
		const index = this.globalPreconditions.findIndex((precondition) => precondition.name === key);

		// If the middleware was found, remove it
		if (index !== -1) this.globalPreconditions.splice(index, 1);

		return super.delete(key);
	}

	public clear(): void {
		this.globalPreconditions.length = 0;
		return super.clear();
	}
}
