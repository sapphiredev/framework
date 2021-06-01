import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<string> {
		const resolved = CoreArgument.resolve(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		if (resolved.success) return this.ok(resolved.value);

		switch (resolved.error) {
			case Identifiers.ArgumentStringTooShort:
				return this.error({
					parameter,
					identifier: Identifiers.ArgumentStringTooShort,
					message: `The argument must be longer than ${context.minimum} characters.`,
					context
				});
			case Identifiers.ArgumentStringTooLong:
				return this.error({
					parameter,
					identifier: Identifiers.ArgumentStringTooLong,
					message: `The argument must be shorter than ${context.maximum} characters.`,
					context
				});
		}
	}

	public static resolve(
		parameter: string,
		options?: { minimum?: number; maximum?: number }
	): Result<string, Identifiers.ArgumentStringTooShort | Identifiers.ArgumentStringTooLong> {
		if (typeof options?.minimum === 'number' && parameter.length < options.minimum) {
			return err(Identifiers.ArgumentStringTooShort);
		}

		if (typeof options?.maximum === 'number' && parameter.length > options.maximum) {
			return err(Identifiers.ArgumentStringTooLong);
		}

		return ok(parameter);
	}
}
