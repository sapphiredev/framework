import type { PieceContext } from '@sapphire/pieces';
import type { GuildEmoji } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { GuildEmojiStructure, resolveEmoji } from '../lib/resolvers/emoji';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export default class extends Argument<GuildEmoji | string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'emoji' });
	}

	public run(parameter: string): ArgumentResult<GuildEmoji | string> {
		const resolved = resolveEmoji(parameter);
		return resolved.success
			? this.ok(this.parseSuccess(resolved.value))
			: this.error({
					parameter,
					identifier: Identifiers.ArgumentEmojiError,
					message: 'The argument did not resolve to an emoji.'
			  });
	}

	public parseSuccess(resolvedValue: string | GuildEmojiStructure): GuildEmoji | string {
		if (resolvedValue instanceof Object) {
			const resolvedGuildEmoji = resolvedValue as GuildEmojiStructure;
			return this.container.client.emojis.resolve(resolvedGuildEmoji.id)!;
		}

		return resolvedValue;
	}
}
