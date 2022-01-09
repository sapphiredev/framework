import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import { Snowflake, Util } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok } from '../parsers/Result';

export function resolveEmoji(parameter: string) {
	const twemoji = TwemojiRegex.exec(parameter)?.[0] ?? null;

	if (twemoji) {
		return ok(twemoji);
	}

	const emojiId = EmojiRegex.exec(parameter)?.groups?.id;

	if (emojiId) {
		const resolved = Util.parseEmoji(emojiId) as GuildEmojiStructure;

		if (resolved) {
			return ok(resolved);
		}
	}

	return err(Identifiers.ArgumentEmojiError);
}

export interface GuildEmojiStructure {
	animated: boolean;
	name: string;
	id: Snowflake;
}
