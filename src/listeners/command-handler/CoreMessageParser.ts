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
		const userMentionPrefix = this.getUserMentionPrefix(message.content);
		const managedRoleMentionPrefix = this.getManagedRoleMentionPrefix(message);
		const { client } = this.container;
		const { regexPrefix } = client.options;
		if (userMentionPrefix) {
			if (message.content.length === userMentionPrefix.length) {
				client.emit(Events.MentionPrefixOnly, message);
				return;
			}

			prefix = userMentionPrefix;
		} else if (managedRoleMentionPrefix) {
			if (message.content.length === managedRoleMentionPrefix.length) {
				client.emit(Events.MentionPrefixOnly, message);
				return;
			}

			prefix = managedRoleMentionPrefix;
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

		const channel = message.channel as GuildBasedChannelTypes;
		return channel.permissionsFor(me).has(this.requiredPermissions, false);
	}

	private getUserMentionPrefix(content: string): string | null {
		const { id } = this.container.client;

		// If no client ID was specified then skip early
		if (!id) return null;

		// If the content is shorter than `<@{n}>` or doesn't start with `<@` then skip early:
		if (content.length < 20 || !content.startsWith('<@')) return null;

		// Retrieve whether the mention is a nickname mention (`<@!{n}>`) or not (`<@{n}>`).
		const nickname = content[2] === '!';
		const idOffset = (nickname ? 3 : 2) as number;
		const idLength = id.length;

		// If the mention doesn't end with `>` then skip early:
		if (content[idOffset + idLength] !== '>') return null;

		// Check whether or not the ID is the same as the client ID:
		const mentionId = content.substr(idOffset, idLength);
		if (mentionId === id) return content.substr(0, idOffset + idLength + 1);

		return null;
	}

	private getManagedRoleMentionPrefix(message: Message): string | null {
		// If the message does not originate in a guild then skip early
		if (!message.guild) return null;

		// If there is no user on the client then skip early
		if (!this.container.client.user) return null;

		// If the content is shorter than `<@&{n}>` or doesn't start with `<@&` then skip early:
		if (message.content.length < 21 || !message.content.startsWith('<@&')) return null;

		// The ID in the message content is offset by 3 characters (`<@&`)
		const idOffset = 3;

		// Get the length managed role
		const managedRole = message.guild.roles.botRoleFor(this.container.client.user);
		const managedRoleIdLength = managedRole?.id.length;

		// If there is no managed role or the length of the role ID is falsy then skip early
		if (!managedRole || !managedRoleIdLength) return null;

		// If the mention doesn't end with `>`, skip early:
		if (message.content[idOffset + managedRoleIdLength] !== '>') return null;

		// Check whether or not the ID is the same as the managed role ID:
		const mentionId = message.content.substr(idOffset, managedRoleIdLength);
		if (mentionId === managedRole.id) return message.content.substr(0, idOffset + managedRoleIdLength + 1);

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
