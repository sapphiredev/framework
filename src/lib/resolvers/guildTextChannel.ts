import { isTextChannel } from '@sapphire/discord.js-utilities';
import type { Guild, TextChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { Result } from '../parsers/Result';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildTextChannel(
	parameter: string,
	guild: Guild
): Result<TextChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildTextChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isTextChannel, Identifiers.ArgumentGuildTextChannelError);
}
