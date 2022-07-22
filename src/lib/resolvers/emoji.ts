import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import { Result } from '@sapphire/result';
import { Util } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';

export function resolveEmoji(parameter: string): Result<EmojiObject, Identifiers> {
	const twemoji = TwemojiRegex.exec(parameter)?.[0] ?? null;

	if (twemoji) {
		return Result.ok<EmojiObject>({
			name: twemoji,
			id: null
		});
	}

	const emojiId = EmojiRegex.test(parameter);

	if (emojiId) {
		const resolved = Util.parseEmoji(parameter) as EmojiObject | null;

		if (resolved) {
			return Result.ok(resolved);
		}
	}

	return Result.err(Identifiers.ArgumentEmojiError);
}

export interface EmojiObject {
	name: string | null;
	id: string | null;
	animated?: boolean;
}
