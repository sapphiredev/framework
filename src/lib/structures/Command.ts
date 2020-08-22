// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { AliasPiece, AliasPieceOptions } from '@sapphire/pieces';
import type { PreconditionContext } from './Precondition';
import type { PieceContext } from '@sapphire/pieces/dist/lib/Piece';
import type { Awaited } from '../utils/Types';
import type { Message } from 'discord.js';

export abstract class Command extends AliasPiece {
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
	public preconditions: readonly CommandPrecondition[];

	/**
	 * Longer version of command's summary and how to use it
	 * @since 1.0.0
	 */
	public extendedHelp: string;

	/**
	 * Allow disabling of the command in a guild or not
	 * @since 1.0.0
	 */
	public guarded: boolean;

	/**
	 * Whether to show the command in the help message or not
	 * @since 1.0.0
	 */
	public hidden: boolean;

	/**
	 * Accepted flags for the command
	 * @since 1.0.0
	 */
	public flags: string[];

	/**
	 * Allow use of quoted strings for arguments
	 * @since 1.0.0
	 */
	public quotedStringSupport: boolean;

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, { name, ...options }: CommandOptions = {}) {
		super(context, { ...options, name: name?.toLowerCase() });
		this.deletable = options.deletable ?? false;
		this.description = options.description ?? '';
		this.preconditions =
			options.preconditions?.map((precondition) =>
				typeof precondition === 'string'
					? { name: precondition, context: {} }
					: { name: precondition.name, context: precondition.context ?? {} }
			) ?? [];
		this.extendedHelp = options.extendedHelp!;
		this.guarded = options.guarded!;
		this.hidden = options.hidden!;
		this.flags = options.flags!;
		this.quotedStringSupport = options.quotedStringSupport!;
	}

	public abstract run(message: Message): Awaited<unknown>;

	/**
	 * Defines the JSON.stringify behavior of the command
	 * @returns {Object}
	 */
	public toJSON(): Record<string, any> {
		return {
			...super.toJSON(),
			deletable: this.deletable,
			description: this.description,
			extendedHelp: this.extendedHelp,
			guarded: this.guarded,
			hidden: this.hidden,
			quotedStringSupport: this.quotedStringSupport
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
	preconditions?: PreconditionResolvable[];
	extendedHelp?: string;
	flags?: string[];
	guarded?: boolean;
	hidden?: boolean;
	quotedStringSupport?: boolean;
}
