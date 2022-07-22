import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveNumber } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentNumberTooSmall]: ({ minimum }: Argument.Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentNumberTooLarge]: ({ maximum }: Argument.Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentNumberError]: () => 'The argument did not resolve to a valid number.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'number' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<number> {
		const resolved = resolveNumber(parameter, { minimum: context.minimum, maximum: context.maximum });
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: this.messages[resolved.unwrapErr()](context),
			context
		});
	}
}
