import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { Guild, NewsChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { Result } from '../parsers/Result';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildNewsChannel(
	parameter: string,
	guild: Guild
): Result<NewsChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildNewsChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isNewsChannel, Identifiers.ArgumentGuildNewsChannelError);
}
