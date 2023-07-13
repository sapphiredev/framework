import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveInteger } from '../lib/resolvers/integer';
import { Argument } from '../lib/structures/Argument';

type Context = Argument.MessageContext | Argument.ChatInputContext;

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentIntegerTooSmall]: ({ minimum }: Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentIntegerTooLarge]: ({ maximum }: Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentIntegerError]: () => 'The argument did not resolve to a valid number.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<number> {
		const resolved = resolveInteger(parameter, { minimum: context.minimum, maximum: context.maximum });
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
			? resolveInteger(context.interaction.options.getString(name) ?? 'NaN', { minimum: context.minimum, maximum: context.maximum })
			: resolveInteger(context.interaction.options.getInteger(name)?.toString() ?? 'NaN', {
					minimum: context.minimum,
					maximum: context.maximum
			  });
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
