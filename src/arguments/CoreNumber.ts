import { container } from '@sapphire/pieces';
import { ApplicationCommandOptionType, type CommandInteractionOption } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveNumber } from '../lib/resolvers/number';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentNumberTooSmall]: ({ minimum }: Argument.Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentNumberTooLarge]: ({ maximum }: Argument.Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentNumberError]: () => 'The argument did not resolve to a valid number.'
	} as const;

	public constructor(context: Argument.LoaderContext) {
		super(context, { name: 'number', optionType: ApplicationCommandOptionType.Number });
	}

	public run(parameter: string | CommandInteractionOption, context: Argument.Context): Argument.Result<number> {
		if (typeof parameter !== 'string') return this.ok(parameter.value as number);
		const resolved = resolveNumber(parameter, { minimum: context.minimum, maximum: context.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}
}

void container.stores.loadPiece({
	name: 'number',
	piece: CoreArgument,
	store: 'arguments'
});
