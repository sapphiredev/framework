import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import type { Snowflake, User } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export async function resolveUser(parameter: string): Promise<Result<User, Identifiers.ArgumentUserError>> {
	const userId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
	const user = userId ? await container.client.users.fetch(userId[1] as Snowflake).catch(() => null) : null;
	if (user) return ok(user);
	return err(Identifiers.ArgumentUserError);
}
