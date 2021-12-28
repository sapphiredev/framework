import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { Identifiers } from '../errors/Identifiers';
import { err, ok } from '../parsers/Result';

export function resolveEmoji(parameter: string) {
	const twemoji = TwemojiRegex.exec(parameter)?.[0] ?? null;

	if (twemoji) {
		return ok(twemoji);
	}

	const emojiId = EmojiRegex.exec(parameter)?.groups?.id;

	if (emojiId) {
		const resolved = container.client.emojis.resolve(emojiId);

		if (resolved) {
			return ok(resolved);
		}
	}

	return err(Identifiers.ArgumentEmojiError);
}
