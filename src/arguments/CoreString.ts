import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<string> {
		if (typeof context.minimum === 'number' && parameter.length < context.minimum) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentStringTooShort,
				message: `The argument must be longer than ${context.minimum} characters.`,
				context
			});
		}

		if (typeof context.maximum === 'number' && parameter.length > context.maximum) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentStringTooLong,
				message: `The argument must be shorter than ${context.maximum} characters.`,
				context
			});
		}

		return this.ok(parameter);
	}
}
