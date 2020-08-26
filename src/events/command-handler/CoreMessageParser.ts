import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.Message> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.Message });
	}

	public async run(message: Message) {
		// Stop bots from running commands.
		if (message.author.bot) return;

		let prefix = '';
		const mentionPrefix = this.getMentionPrefix(message.content);
		if (mentionPrefix) {
			if (message.content.length === mentionPrefix.length) {
				this.client.emit(Events.MentionPrefixOnly, message);
				return;
			}

			prefix = mentionPrefix;
		} else {
			const prefixes = await this.client.fetchPrefix(message);
			const parsed = this.getPrefix(message.content, prefixes);
			if (parsed !== null) prefix = parsed;
		}

		if (prefix) this.client.emit(Events.PrefixedMessage, message, prefix);
	}

	private getMentionPrefix(content: string): string | null {
		// If no client ID was specified, return null:
		if (!this.client.id) return null;

		// If the content is shorter than `<@{n}>` or doesn't start with `<@`, skip early:
		if (content.length < 20 || !content.startsWith('<@')) return null;

		// Retrieve whether the mention is a nickname mention (`<@!{n}>`) or not (`<@{n}>`).
		const nickname = content[2] === '!';
		const idOffset = (nickname ? 3 : 2) as number;
		const idLength = this.client.id.length;

		// If the mention doesn't end with `>`, skip early:
		if (content[idOffset + idLength] !== '>') return null;

		// Check whether or not the ID is the same as the client ID:
		const mentionID = content.substr(idOffset, idLength);
		if (mentionID === this.client.id) return content.substr(0, idOffset + idLength + 1);

		return null;
	}

	private getPrefix(content: string, prefixes: readonly string[] | string | null): string | null {
		if (prefixes === null) return null;
		if (typeof prefixes === 'string') return content.startsWith(prefixes) ? prefixes : null;
		return prefixes.find((prefix) => content.startsWith(prefix)) ?? null;
	}
}
