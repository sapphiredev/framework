import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveDate } from '../lib/resolvers/date';
import { Argument } from '../lib/structures/Argument';

type Context = Argument.MessageContext | Argument.ChatInputContext;

export class CoreArgument extends Argument<Date> {
	private readonly messages = {
		[Identifiers.ArgumentDateTooEarly]: ({ minimum }: Context) => `The given date must be after ${new Date(minimum!).toISOString()}.`,
		[Identifiers.ArgumentDateTooFar]: ({ maximum }: Context) => `The given date must be before ${new Date(maximum!).toISOString()}.`,
		[Identifiers.ArgumentDateError]: () => 'The argument did not resolve to a date.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'date' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<Date> {
		const resolved = resolveDate(parameter, { minimum: context.minimum, maximum: context.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<Date> {
		const resolved = resolveDate(context.interaction.options.getString(name) ?? '', { minimum: context.minimum, maximum: context.maximum });
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
