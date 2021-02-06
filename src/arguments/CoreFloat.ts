import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentResult } from '../lib/structures/Argument';
import type { BoundedArgumentContext } from '../lib/types/Arguments';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'float' });
	}

	public run(parameter: string, context: BoundedArgumentContext): ArgumentResult<number> {
		const parsed = Number(parameter);

		if (Number.isNaN(parsed)) {
			return this.error({
				parameter,
				identifier: 'ArgumentFloatInvalidFloat',
				message: 'The argument did not resolve to a valid floating point number.',
				context
			});
		}

		const { minimum, maximum } = context;

		if (minimum && parsed < minimum) {
			return this.error({
				parameter,
				identifier: 'ArgumentFloatTooSmall',
				message: `The argument must be greater than ${minimum}.`,
				context
			});
		}

		if (maximum && parsed > maximum) {
			return this.error({
				parameter,
				identifier: 'ArgumentFloatTooBig',
				message: `The argument must be less than ${maximum}.`,
				context
			});
		}

		return this.ok(parsed);
	}
}
