import type { Message } from 'discord.js';
import type * as Lexure from 'lexure';
import { UserError } from '../errors/UserError';
import type { Command } from '../structures/Command';
import { err, isOk, Ok, Result } from './Result';

export class Args {
	public message: Message;
	public command: Command;
	private parser: Lexure.Args;
	private states: Lexure.ArgsState[] = [];

	public constructor(message: Message, command: Command, parser: Lexure.Args) {
		this.message = message;
		this.command = command;
		this.parser = parser;
	}

	/**
	 * Sets the parser to the first token.
	 */
	public start(): Args {
		this.parser.state = {
			usedIndices: new Set(),
			position: 0,
			positionFromEnd: this.parser.parserOutput.ordered.length - 1
		};
		return this;
	}

	public async pick<K extends keyof ArgType>(type: K): Promise<Result<ArgType[K], UserError>> {
		const argument = this.message.client.arguments.get(type);
		if (!argument) throw new TypeError(`The Argument ${type} was not found.`);

		const state = this.parser.save();
		const data = this.parser.single();
		if (!data) return err(new UserError('MissingArguments', 'There are no more arguments.'));

		const result = await argument.run(data, {
			message: this.message,
			command: this.command
		});
		if (isOk(result)) return result as Ok<ArgType[K]>;

		this.parser.restore(state);
		return result;
	}

	public async rest<K extends keyof ArgType>(type: K): Promise<Result<ArgType[K], UserError>> {
		const argument = this.message.client.arguments.get(type);
		if (!argument) throw new TypeError(`The Argument ${type} was not found.`);

		const state = this.parser.save();
		const data = this.parser.many().reduce((acc, token) => `${acc}${token.value}${token.trailing}`, '');
		if (!data) throw new UserError('MissingArguments', 'There are no more arguments.');

		const result = await argument.run(data, {
			message: this.message,
			command: this.command
		});
		if (isOk(result)) return result as Ok<ArgType[K]>;

		this.parser.restore(state);
		return result;
	}

	public save() {
		this.states.push(this.parser.save());
	}

	public restore() {
		if (this.states.length !== 0) this.parser.restore(this.states.pop()!);
	}
}

export interface ArgType {
	string: string;
	integer: number;
}
