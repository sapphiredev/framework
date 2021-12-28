import { EmojiRegex, TwemojiRegex } from '@sapphire/discord-utilities';
import { Identifiers } from '../errors/Identifiers';
import { err, ok } from '../parsers/Result';
import type { SapphireClient } from '../SapphireClient';

export function resolveEmoji(parameter: string, client: SapphireClient) {
	const emoji = EmojiRegex.exec(parameter)?.[3];
	const twemoji = TwemojiRegex.exec(parameter)?.[0] ?? null;
	const resolvable = emoji ? client.emojis.resolve(emoji) : twemoji;

	if (resolvable) return ok(resolvable);
	return err(Identifiers.ArgumentEmojiError);
}
