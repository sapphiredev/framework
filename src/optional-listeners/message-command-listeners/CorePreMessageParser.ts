import { GuildBasedChannelTypes, isDMChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { Message, PermissionsBitField } from 'discord.js';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.PreMessageParsed> {
	private readonly requiredPermissions = new PermissionsBitField(['ViewChannel', 'SendMessages']).freeze();

	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.PreMessageParsed });
	}

	public async run(message: Message) {
		// If the bot cannot run the command due to lack of permissions, return.
		const canRun = await this.canRunInChannel(message);
		if (!canRun) return;

		let prefix: string | null | RegExp = null;
		const mentionPrefix = this.getMentionPrefix(message);
		const { client } = this.container;
		const { regexPrefix } = client.options;

		if (mentionPrefix) {
			if (message.content.length === mentionPrefix.length) {
				client.emit(SapphireEvents.MentionPrefixOnly, message);
				return;
			}

			prefix = mentionPrefix;
		} else if (regexPrefix?.test(message.content)) {
			prefix = regexPrefix;
		} else {
			const prefixes = await client.fetchPrefix(message);
			const parsed = this.getPrefix(message.content, prefixes);
			if (parsed !== null) prefix = parsed;
		}

		if (prefix === null) client.emit(SapphireEvents.NonPrefixedMessage, message);
		else client.emit(SapphireEvents.PrefixedMessage, message, prefix);
	}

	private async canRunInChannel(message: Message): Promise<boolean> {
		if (isDMChannel(message.channel)) return true;

		const me = await message.guild?.members.fetchMe();
		if (!me) return false;

		const channel = message.channel as GuildBasedChannelTypes;
		return channel.permissionsFor(me).has(this.requiredPermissions, true);
	}

	private getMentionPrefix(message: Message): string | null {
		if (this.container.client.disableMentionPrefix) return null;
		// If the content is shorter than 20 characters, or does not start with `<@` then skip early:
		if (message.content.length < 20 || !message.content.startsWith('<@')) return null;

		// Calculate the offset and the ID that is being provided
		const [offset, id] =
			message.content[2] === '&'
				? [3, message.guild?.roles.botRoleFor(this.container.client.id!)?.id]
				: [message.content[2] === '!' ? 3 : 2, this.container.client.id];

		if (!id) return null;

		const offsetWithId = offset + id.length;

		// If the mention doesn't end with `>`, skip early:
		if (message.content[offsetWithId] !== '>') return null;

		// Check whether or not the ID is the same as the managed role ID:
		const mentionId = message.content.substring(offset, offsetWithId);
		if (mentionId === id) return message.content.substring(0, offsetWithId + 1);

		return null;
	}

	private getPrefix(content: string, prefixes: readonly string[] | string | null): string | null {
		if (prefixes === null) return null;
		const { caseInsensitivePrefixes } = this.container.client.options;

		if (caseInsensitivePrefixes) content = content.toLowerCase();

		if (typeof prefixes === 'string') {
			return content.startsWith(caseInsensitivePrefixes ? prefixes.toLowerCase() : prefixes) ? prefixes : null;
		}

		return prefixes.find((prefix) => content.startsWith(caseInsensitivePrefixes ? prefix.toLowerCase() : prefix)) ?? null;
	}
}
