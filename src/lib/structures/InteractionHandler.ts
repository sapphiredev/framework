import { Piece, PieceContext, PieceJSON, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import type { Interaction } from 'discord.js';
import { some, Maybe, none, None } from '../parsers/Maybe';

export abstract class InteractionHandler extends Piece {
	/**
	 * The type for this handler
	 * @since 2.0.0
	 */
	public readonly interactionHandlerType: InteractionHandlerTypes;

	public constructor(context: PieceContext, options: InteractionHandlerOptions) {
		super(context, options);

		this.interactionHandlerType = options.interactionHandlerType;
	}

	public abstract run(interaction: Interaction, parsedData?: unknown): unknown;

	/**
	 * A custom function that will be called when checking if an interaction should be passed to this handler.
	 * You can use this method to not only filter by ids, but also pre-parse the data from the id for use in the run method.
	 *
	 * By default, all interactions of the type you specified will run in a handler. You should override this method
	 * to change that behavior.
	 *
	 * @example
	 * ```typescript
	 * // Parsing a button handler
	 * public override parse(interaction: ButtonInteraction) {
	 *   if (interaction.customId.startsWith('vlad')) {
	 * 	   // Returning a `some` here means that the run method should be called next!
	 *     return this.some({ isVladAwesome: true, awesomenessLevel: 9001 });
	 *   }
	 *
	 *   // Returning a `none` means this interaction shouldn't run in this handler
	 *   return this.none();
	 * }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Getting data from a database based on the custom id
	 * public override async parse(interaction: ButtonInteraction) {
	 *   // This code is purely for demonstration purposes only!
	 *   if (interaction.customId.startsWith('example-data')) {
	 *     const [, userId, channelId] = interaction.customId.split('.');
	 *     return this.some(await container.prisma.exampleData.findFirst({ where: { userId, channelId } }));
	 *   }
	 *
	 *   // Returning a `none` means this interaction shouldn't run in this handler
	 *   return this.none();
	 * }
	 * ```
	 *
	 * @returns A maybe or a promise returning a maybe that indicates if this interaction should be handled by this handler,
	 * and what extra data should be passed to the {@link InteractionHandler#run run method}
	 */
	public parse<T>(_interaction: Interaction): Awaited<Maybe<T | undefined>> {
		return this.some();
	}

	public some(): Maybe<undefined>;
	public some<T>(data: T): Maybe<T>;
	public some<T>(data?: T): Maybe<T | undefined> {
		return some(data);
	}

	public none(): None {
		return none();
	}

	public toJSON(): InteractionHandlerJSON {
		return {
			...super.toJSON(),
			interactionHandlerType: this.interactionHandlerType
		};
	}
}

export interface InteractionHandlerOptions extends PieceOptions {
	readonly interactionHandlerType: InteractionHandlerTypes;
}

export interface InteractionHandlerJSON extends PieceJSON {
	interactionHandlerType: InteractionHandlerTypes;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InteractionHandler {
	export type Options = InteractionHandlerOptions;
	export type ParseResult = ReturnType<InteractionHandler['parse']>;
}

export const enum InteractionHandlerTypes {
	// Specifically focused types
	Button = 'BUTTON',
	SelectMenu = 'SELECT_MENU',
	// TODO: Whenever autocompletes release, decide if they'll be handled via this or as a method in the command class
	// as I don't want to make that class be a mess :pepeHands:

	// More free-falling handlers, for 1 shared handler between buttons and select menus (someone will have a use for this >,>)
	MessageComponent = 'MESSAGE_COMPONENT'
}
