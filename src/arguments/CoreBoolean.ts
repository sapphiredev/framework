import type { PieceContext } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveBoolean } from '../lib/resolvers/boolean';
import { Argument } from '../lib/structures/Argument';
import type { BooleanArgumentContext } from '../lib/types/ArgumentContexts';

export class CoreArgument extends Argument<boolean> {
	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public override messageRun(parameter: string, context: BooleanArgumentContext): Argument.Result<boolean> {
		const resolved = resolveBoolean(parameter, { truths: context.truths, falses: context.falses });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a boolean.',
				context
			})
		);
	}

	public override chatInputRun(
		name: string,
		context: Pick<BooleanArgumentContext, 'truths' | 'falses'> & Argument.ChatInputContext
	): Argument.Result<boolean> {
		const resolved = context.useStringResolver
			? resolveBoolean(context.interaction.options.getString(name) ?? '', { truths: context.truths, falses: context.falses })
			: (Result.from(context.interaction.options.getBoolean(name) ?? Result.err(Identifiers.ArgumentBooleanError)) as Result<
					boolean,
					Identifiers.ArgumentBooleanError
			  >);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a boolean.',
				context
			})
		);
	}
}
