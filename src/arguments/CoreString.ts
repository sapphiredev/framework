import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveString } from '../lib/resolvers/string';
import { Argument } from '../lib/structures/Argument';

type Context = Argument.MessageContext | Argument.ChatInputContext;

export class CoreArgument extends Argument<string> {
	private readonly messages = {
		[Identifiers.ArgumentStringTooShort]: ({ minimum }: Context) => `The argument must be longer than ${minimum} characters.`,
		[Identifiers.ArgumentStringTooLong]: ({ maximum }: Context) => `The argument must be shorter than ${maximum} characters.`
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<string> {
		const resolved = resolveString(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<string> {
		const resolved = resolveString(context.interaction.options.getString(name) ?? '', { minimum: context?.minimum, maximum: context?.maximum });
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
