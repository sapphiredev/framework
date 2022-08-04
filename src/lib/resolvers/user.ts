import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Snowflake, User } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';

export async function resolveUser(parameter: string): Promise<Result<User, Identifiers.ArgumentUserError>> {
	const userId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
	const user = userId ? await container.client.users.fetch(userId[1] as Snowflake).catch(() => null) : null;
	if (user) return Result.ok(user);
	return Result.err(Identifiers.ArgumentUserError);
}
