import { SnowflakeRegex } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Guild, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';

export async function resolveGuild(parameter: string): Promise<Result<Guild, Identifiers.ArgumentGuildError>> {
	const guildId = SnowflakeRegex.exec(parameter);
	const guild = guildId ? await container.client.guilds.fetch(guildId[1] as Snowflake).catch(() => null) : null;

	if (guild) {
		return Result.ok(guild);
	}

	return Result.err(Identifiers.ArgumentGuildError);
}
