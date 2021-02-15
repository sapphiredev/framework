import type { Message } from 'discord.js';
import { ok } from '../parsers/Result';
import { PriorityPieceStore } from './base/PriorityPieceStore';
import type { Command } from './Command';
import { Essential } from './Essential';

export class EssentialStore extends PriorityPieceStore<Essential> {
	public constructor() {
		super(Essential as any, { name: 'essentials' });
	}

	/**
	 * Runs all [[Essential]]s.
	 * @since 1.0.0
	 * @param message The message that triggered this run.
	 * @param command The command that was used in the message.
	 * @param context The context defining the command handler information.
	 */
	public async run(message: Message, command: Command, context: Essential.Context): Essential.AsyncResult {
		for (const piece of this.sortedPieces) {
			const result = await piece.run(message, command, context);
			if (!result.success) return result;
		}

		return ok();
	}
}
