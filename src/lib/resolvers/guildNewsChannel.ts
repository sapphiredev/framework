import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, NewsChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildNewsChannel(
	parameter: string,
	guild: Guild
): Result<NewsChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildNewsChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isNewsChannel, Identifiers.ArgumentGuildNewsChannelError);
}
