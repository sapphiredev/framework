import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveString } from '../lib/resolvers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<string> {
	private readonly messages = {
		[Identifiers.ArgumentStringTooShort]: ({ minimum }: ArgumentContext) => `The argument must be longer than ${minimum} characters.`,
		[Identifiers.ArgumentStringTooLong]: ({ maximum }: ArgumentContext) => `The argument must be shorter than ${maximum} characters.`
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<string> {
		const resolved = resolveString(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: this.messages[resolved.error](context),
			context
		});
	}
}
