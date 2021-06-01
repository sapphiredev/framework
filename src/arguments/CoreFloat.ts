import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'float' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
		const resolved = CoreArgument.resolve(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		if (resolved.success) return this.ok(resolved.value);

		if (resolved.error === Identifiers.ArgumentFloatTooSmall) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentFloatTooSmall,
				message: `The argument must be greater than ${context.minimum}.`,
				context
			});
		}

		if (resolved.error === Identifiers.ArgumentFloatTooBig) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentFloatTooBig,
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
		if (Number.isNaN(parsed)) return err('The argument did not resolve to a valid floating point number.');

		if (typeof options?.minimum === 'number' && parsed < options.minimum) return err(Identifiers.ArgumentFloatTooSmall);
		if (typeof options?.maximum === 'number' && parsed > options.maximum) return err(Identifiers.ArgumentFloatTooBig);

		return ok(parsed);
	}
}
