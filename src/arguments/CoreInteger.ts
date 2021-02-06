import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentResult } from '../lib/structures/Argument';
import type { BoundedArgumentContext } from '../lib/types/Arguments';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public run(parameter: string, context: BoundedArgumentContext): ArgumentResult<number> {
		const parsed = Number(parameter);

		if (!Number.isInteger(parsed)) {
			return this.error({
				parameter,
				identifier: 'ArgumentIntegerInvalidNumber',
				message: 'The argument did not resolve to an integer.',
				context
			});
		}

		const { minimum, maximum } = context;

		if (minimum && parsed < minimum) {
			return this.error({
				parameter,
				identifier: 'ArgumentIntegerTooSmall',
				message: `The argument must be greater than ${minimum}.`,
				context
			});
		}

		if (maximum && parsed > maximum) {
			return this.error({
				parameter,
				identifier: 'ArgumentIntegerTooBig',
				message: `The argument must be less than ${maximum}.`,
				context
			});
		}

		return this.ok(parsed);
	}
}
