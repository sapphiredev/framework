import type { PieceContext } from '@sapphire/pieces';
import type { GuildEmoji } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveEmoji } from '../lib/resolvers/emoji';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export default class extends Argument<GuildEmoji | string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'emoji' });
	}

	public run(parameter: string): ArgumentResult<GuildEmoji | string> {
		const resolved = resolveEmoji(parameter);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: Identifiers.ArgumentEmojiError,
			message: 'The argument did not resolve to an emoji.'
		});
	}
}
