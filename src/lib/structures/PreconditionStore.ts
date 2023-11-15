import { Store } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { ChatInputCommand, ContextMenuCommand, MessageCommand } from '../types/CommandTypes';
import { Precondition, type AsyncPreconditionResult } from './Precondition';

export class PreconditionStore extends Store<Precondition, 'preconditions'> {
	private readonly globalPreconditions: Precondition[] = [];

	public constructor() {
		super(Precondition, { name: 'preconditions' });
	}

	public async messageRun(message: Message, command: MessageCommand, context: Precondition.Context = {}): AsyncPreconditionResult {
		for (const precondition of this.globalPreconditions) {
			const result = precondition.messageRun
				? await precondition.messageRun(message, command, context)
				: await precondition.error({
						identifier: Identifiers.PreconditionMissingMessageHandler,
						message: `The precondition "${precondition.name}" is missing a "messageRun" handler, but it was requested for the "${command.name}" command.`
				  });

			if (result.isErr()) {
				return result;
			}
		}

		return Result.ok();
	}

	public async chatInputRun(
		interaction: ChatInputCommandInteraction,
		command: ChatInputCommand,
		context: Precondition.Context = {}
	): AsyncPreconditionResult {
		for (const precondition of this.globalPreconditions) {
			const result = precondition.chatInputRun
				? await precondition.chatInputRun(interaction, command, context)
				: await precondition.error({
						identifier: Identifiers.PreconditionMissingChatInputHandler,
						message: `The precondition "${precondition.name}" is missing a "chatInputRun" handler, but it was requested for the "${command.name}" command.`
				  });

			if (result.isErr()) {
				return result;
			}
		}

		return Result.ok();
	}

	public async contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand,
		context: Precondition.Context = {}
	): AsyncPreconditionResult {
		for (const precondition of this.globalPreconditions) {
			const result = precondition.contextMenuRun
				? await precondition.contextMenuRun(interaction, command, context)
				: await precondition.error({
						identifier: Identifiers.PreconditionMissingContextMenuHandler,
						message: `The precondition "${precondition.name}" is missing a "contextMenuRun" handler, but it was requested for the "${command.name}" command.`
				  });

			if (result.isErr()) {
				return result;
			}
		}

		return Result.ok();
	}

	public override set(key: string, value: Precondition): this {
		if (value.position !== null) {
			const index = this.globalPreconditions.findIndex((precondition) => precondition.position! >= value.position!);

			// If a precondition with lower priority wasn't found, push to the end of the array
			if (index === -1) this.globalPreconditions.push(value);
			else this.globalPreconditions.splice(index, 0, value);
		}

		return super.set(key, value);
	}

	public override delete(key: string): boolean {
		const index = this.globalPreconditions.findIndex((precondition) => precondition.name === key);

		// If the precondition was found, remove it
		if (index !== -1) this.globalPreconditions.splice(index, 1);

		return super.delete(key);
	}

	public override clear(): void {
		this.globalPreconditions.length = 0;
		return super.clear();
	}
}
