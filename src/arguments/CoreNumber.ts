import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveNumber } from '../lib/resolvers/number';
import { Argument } from '../lib/structures/Argument';

type Context = Argument.MessageContext | Argument.ChatInputContext;

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentNumberTooSmall]: ({ minimum }: Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentNumberTooLarge]: ({ maximum }: Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentNumberError]: () => 'The argument did not resolve to a valid number.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'number' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<number> {
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

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<number> {
		const resolved = context.useStringResolver
			? resolveNumber(context.interaction.options.getString(name) ?? 'NaN', { minimum: context.minimum, maximum: context.maximum })
			: resolveNumber(context.interaction.options.getNumber(name)?.toString() ?? 'NaN', { minimum: context.minimum, maximum: context.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}
}
