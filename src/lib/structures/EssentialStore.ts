import type { Message } from 'discord.js';
import { ok } from '../parsers/Result';
import { PriorityPieceStore } from './base/PriorityPieceStore';
import type { Command } from './Command';
import { Essential } from './Essential';

export class EssentialStore extends PriorityPieceStore<Essential> {
	public constructor() {
		super(Essential as any, { name: 'essentials' });
	}

	public async run(message: Message, command: Command, context: Essential.Context): Essential.AsyncResult {
		for (const precondition of this.sortedPieces) {
			const result = await precondition.run(message, command, context);
			if (!result.success) return result;
		}

		return ok();
	}
}
