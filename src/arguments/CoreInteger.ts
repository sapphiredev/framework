import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
		const resolved = CoreArgument.resolve(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		if (resolved.success) return this.ok(resolved.value);

		if (resolved.error === Identifiers.ArgumentIntegerTooSmall) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentIntegerTooSmall,
				message: `The argument must be greater than ${context.minimum}.`,
				context
			});
		}

		if (resolved.error === Identifiers.ArgumentIntegerTooBig) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentIntegerTooBig,
				message: `The argument must be less than ${context.maximum}.`,
				context
			});
		}

		return this.error({
			parameter,
			message: resolved.error,
			context
		});
	}

	public static resolve(parameter: string, options?: { minimum?: number; maximum?: number }): Result<number, string> {
		const parsed = Number(parameter);
		if (Number.isInteger(parsed)) return err('The argument did not resolve to an integer.');

		if (typeof options?.minimum === 'number' && parsed < options.minimum) return err(Identifiers.ArgumentIntegerTooSmall);
		if (typeof options?.maximum === 'number' && parsed > options.maximum) return err(Identifiers.ArgumentIntegerTooBig);

		return ok(parsed);
	}
}
