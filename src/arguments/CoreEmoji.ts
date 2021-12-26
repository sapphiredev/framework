import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildEmoji } from 'discord.js';
import { Identifiers } from '..';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export default class extends Argument<GuildEmoji | string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'emoji' });
	}

	public run(parameter: string): ArgumentResult<GuildEmoji | string> {
		const emoji = EmojiRegex.exec(parameter)?.[3];
		const twemoji = new RegExp(TwemojiRegex).exec(parameter)?.[0] ?? null;
		const resolvable = emoji ? this.container.client.emojis.resolve(emoji) : twemoji;

		if (resolvable) return this.ok(resolvable);

		return this.error({
			parameter,
			identifier: Identifiers.ArgumentEmojiError,
			message: 'The argument did not resolve to an emoji.'
		});
	}
}
