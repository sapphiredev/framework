import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
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
				message: 'The argument did not resolve to an integer.',
				context
			});
		}

		const { minimum, maximum } = context;

		if (minimum && parsed < minimum) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentIntegerTooSmall,
				message: `The argument must be greater than ${context.minimum}.`,
				context
			});
		}

		if (maximum && parsed > maximum) {
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
