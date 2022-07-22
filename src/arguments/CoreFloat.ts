import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveFloat } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentFloatTooSmall]: ({ minimum }: Argument.Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentFloatTooLarge]: ({ maximum }: Argument.Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentFloatError]: () => 'The argument did not resolve to a valid decimal.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'float' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<number> {
		const resolved = resolveFloat(parameter, { minimum: context.minimum, maximum: context.maximum });
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: this.messages[resolved.unwrapErr()](context),
			context
		});
	}
}
