import type { PieceContext } from '@sapphire/pieces';
import { resolveEnum } from '../lib/resolvers/enum';
import { Argument } from '../lib/structures/Argument';
import type { EnumArgumentContext } from '../lib/types/ArgumentContexts';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'enum' });
	}

	public override messageRun(parameter: string, context: EnumArgumentContext): Argument.Result<string> {
		const resolved = resolveEnum(parameter, { enum: context.enum, caseInsensitive: context.caseInsensitive });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: `The argument must have one of the following values: ${context.enum?.join(', ')}`,
				context
			})
		);
	}

	public override chatInputRun(
		name: string,
		context: Pick<EnumArgumentContext, 'enum' | 'caseInsensitive'> & Argument.ChatInputContext
	): Argument.Result<string> {
		const resolved = resolveEnum(context.interaction.options.getString(name) ?? '', {
			enum: context.enum,
			caseInsensitive: context.caseInsensitive
		});
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: `The argument must have one of the following values: ${context.enum?.join(', ')}`,
				context
			})
		);
	}
}
