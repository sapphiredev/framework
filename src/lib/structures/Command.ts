// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import type { AliasPieceOptions } from '@sapphire/pieces';
import type { PieceContext } from '@sapphire/pieces/dist/lib/Piece';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';
import { Args } from '../utils/Args';
import { PreconditionContainerAll } from '../utils/preconditions/PreconditionContainer';
import type { PreconditionContainerResolvable } from '../utils/preconditions/PreconditionContainerAny';
import type { Awaited } from '../utils/Types';
import { BaseAliasPiece } from './base/BaseAliasPiece';
import type { PreconditionContext } from './Precondition';

export abstract class Command extends BaseAliasPiece {
	/**
	 * Delete command's response if the trigger message was deleted
	 * @since 1.0.0
	 */
	public deletable: boolean;

	/**
	 * A basic summary about the command
	 * @since 1.0.0
	 */
	public description: string;

	/**
	 * The preconditions to be run.
	 * @since 1.0.0
	 */
	public preconditions: PreconditionContainerAll;

	/**
	 * Longer version of command's summary and how to use it
	 * @since 1.0.0
	 */
	public extendedHelp: string;

	/**
	 * Accepted flags for the command
	 * @since 1.0.0
	 */
	public flags: string[];

	/**
	 * The lexer to be used for command parsing
	 * @since 1.0.0
	 * @private
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#lexer = new Lexure.Lexer();

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, { name, ...options }: CommandOptions = {}) {
		super(context, { ...options, name: name?.toLowerCase() });
		this.deletable = options.deletable ?? false;
		this.description = options.description ?? '';
		this.preconditions = new PreconditionContainerAll(this.client, options.preconditions ?? []);
		this.extendedHelp = options.extendedHelp!;
		this.flags = options.flags!;
		this.#lexer.setQuotes(
			options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'] // Corner brackets (CJK)
			]
		);
	}

	public preParse(message: Message, commandName: string, prefix: string): Awaited<unknown> {
		const input = message.content.substr(prefix.length + commandName.length + 1);
		const parser = new Lexure.Parser(this.#lexer.setInput(input).lex());
		const args = new Lexure.Args(parser.parse());
		return new Args(message, this, args);
	}

	public abstract run(message: Message, args: unknown): Awaited<unknown>;

	/**
	 * Defines the JSON.stringify behavior of the command
	 * @returns {Object}
	 */
	public toJSON(): Record<string, any> {
		return {
			...super.toJSON(),
			deletable: this.deletable,
			description: this.description,
			extendedHelp: this.extendedHelp
		};
	}
}

export interface CommandPrecondition {
	readonly name: string;
	readonly context: Readonly<PreconditionContext>;
}

export type PreconditionResolvable = string | { name: string; context?: PreconditionContext };

export interface CommandOptions extends AliasPieceOptions {
	bucket?: number;
	deletable?: boolean;
	description?: string;
	preconditions?: PreconditionContainerResolvable;
	extendedHelp?: string;
	flags?: string[];
	quotes?: [string, string][];
}
