import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveString } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<string> {
	private readonly messages = {
		[Identifiers.ArgumentStringTooShort]: ({ minimum }: Argument.Context) => `The argument must be longer than ${minimum} characters.`,
		[Identifiers.ArgumentStringTooLong]: ({ maximum }: Argument.Context) => `The argument must be shorter than ${maximum} characters.`
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<string> {
		const resolved = resolveString(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		return resolved.mapErr((identifier) =>
			this.errorContext({
				parameter,
				identifier,
				message: this.messages[resolved.unwrapErr()](context),
				context
			})
		);
	}
}
