import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import { Util } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok } from '../parsers/Result';

export function resolveEmoji(parameter: string) {
	const twemoji = TwemojiRegex.exec(parameter)?.[0] ?? null;

	if (twemoji) {
		return ok(twemoji);
	}

	const emojiId = EmojiRegex.exec(parameter)?.groups?.id;

	if (emojiId) {
		const resolved = Util.parseEmoji(emojiId) as EmojiObject;

		if (resolved) {
			return ok(resolved);
		}
	}

	return err(Identifiers.ArgumentEmojiError);
}

export interface EmojiObject {
	name: string | null;
	id: string | null;
	animated?: boolean;
}
