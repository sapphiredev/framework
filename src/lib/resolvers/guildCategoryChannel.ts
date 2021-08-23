import { isCategoryChannel } from '@sapphire/discord.js-utilities';
import type { CategoryChannel, Guild } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { Result } from '../parsers/Result';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildCategoryChannel(
	parameter: string,
	guild: Guild
): Result<CategoryChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildCategoryChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isCategoryChannel, Identifiers.ArgumentGuildCategoryChannelError);
}
