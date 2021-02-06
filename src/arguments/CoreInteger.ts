import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
		const parsed = Number(parameter);

		if (!Number.isInteger(parsed)) {
			return this.error({
				parameter,
				message: 'The argument did not resolve to an integer.',
				context
			});
		}

		if (typeof context.minimum === 'number' && parsed < context.minimum) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentIntegerTooSmall,
				message: `The argument must be greater than ${context.minimum}.`,
				context
			});
		}

		if (typeof context.maximum === 'number' && parsed > context.maximum) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentIntegerTooBig,
				message: `The argument must be less than ${context.maximum}.`,
				context
			});
		}

		return this.ok(parsed);
	}
}
