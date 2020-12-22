import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';

export interface IInternationalization {
	/**
	 * Resolves an i18n key from a message.
	 * @param message The message for context.
	 * @example
	 * ```typescript
	 * // Example usage:
	 * const name = await this.client.i18n.resolveNameFromMessage(message);
	 * const content = await this.client.i18n.resolveValue(name, 'prefix', { prefix });
	 * await message.channel.send(`The prefix is: ${content}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Example implementation:
	 * return message.guild
	 *   ? (await database.get('guilds', message.guild.id))?.language
	 *   : 'en-US';
	 * ```
	 */
	resolveNameFromMessage(message: Message): Awaited<string>;

	/**
	 * Resolves an i18n value from the language name and the key.
	 * @param name The name of the language key, e.g. `'en-US'`.
	 * @param key The key to retrieve.
	 * @param values The i18n options.
	 * @example
	 * ```typescript
	 * // Example usage:
	 * const prefix = 's!';
	 * const content = await this.client.i18n.resolveValue('en-US', 'prefix', { prefix });
	 * // Returns "The prefix is `s!`."
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Example implementation (i18next):
	 * const t = languages.get(name);
	 * return t(key, ...values);
	 * ```
	 */
	resolveValue(name: string, key: string, ...values: readonly unknown[]): Awaited<string>;
}
