import { GuildBasedChannelTypes, isDMChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { Message, Permissions } from 'discord.js';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreMessageParsed> {
	private readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']).freeze();
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreMessageParsed });
	}

	public async run(message: Message) {
		// If the bot cannot run the command due to lack of permissions, return.
		const canRun = await this.canRunInChannel(message);
		if (!canRun) return;

		let prefix = null;
		const mentionPrefix = this.getMentionPrefix(message);
		const { client } = this.container;
		const { regexPrefix } = client.options;
		if (mentionPrefix) {
			if (message.content.length === mentionPrefix.length) {
				client.emit(Events.MentionPrefixOnly, message);
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

		if (prefix === null) client.emit(Events.NonPrefixedMessage, message);
		else client.emit(Events.PrefixedMessage, message, prefix);
	}

	private async canRunInChannel(message: Message): Promise<boolean> {
		if (isDMChannel(message.channel)) return true;

		const me = message.guild!.me ?? (message.client.id ? await message.guild!.members.fetch(message.client.id) : null);
		if (!me) return false;

		if (me.isCommunicationDisabled()) return false;

		const channel = message.channel as GuildBasedChannelTypes;
		return channel.permissionsFor(me).has(this.requiredPermissions, false);
	}

	private getMentionPrefix(message: Message): string | null {
		if (this.container.client.disableMentionPrefix) return null;
		// If the content is shorter than 20 characters, or does not start with `<@` then skip early:
		if (message.content.length < 20 || !message.content.startsWith('<@')) return null;

		// Calculate the offset and the ID that is being provided
		const [offset, id] =
			message.content[2] === '&'
				? [3, message.guild?.roles.botRoleFor(message.guild.me!)?.id]
				: [message.content[2] === '!' ? 3 : 2, this.container.client.id];

		if (!id) return null;

		// If the mention doesn't end with `>`, skip early:
		if (message.content[offset + id.length] !== '>') return null;

		// Check whether or not the ID is the same as the managed role ID:
		const mentionId = message.content.substr(offset, id.length);
		if (mentionId === id) return message.content.substr(0, offset + id.length + 1);

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
