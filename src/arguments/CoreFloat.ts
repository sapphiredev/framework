import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveFloat } from '../lib/resolvers/float';
import { Argument } from '../lib/structures/Argument';

type Context = Argument.MessageContext | Argument.ChatInputContext;

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentFloatTooSmall]: ({ minimum }: Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentFloatTooLarge]: ({ maximum }: Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentFloatError]: () => 'The argument did not resolve to a valid decimal.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'float' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<number> {
		const resolved = resolveFloat(parameter, { minimum: context.minimum, maximum: context.maximum });
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
			? resolveFloat(context.interaction.options.getString(name) ?? 'NaN', { minimum: context.minimum, maximum: context.maximum })
			: resolveFloat(context.interaction.options.getNumber(name)?.toString() ?? 'NaN', { minimum: context.minimum, maximum: context.maximum });
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
