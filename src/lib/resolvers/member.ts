import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { Guild, GuildMember, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export async function resolveMember(parameter: string, guild: Guild): Promise<Result<GuildMember, Identifiers.ArgumentMemberError>> {
	const member = (await resolveById(parameter, guild)) ?? (await resolveByQuery(parameter, guild));
	if (member) return ok(member);
	return err(Identifiers.ArgumentMemberError);
}

async function resolveById(argument: string, guild: Guild): Promise<GuildMember | null> {
	const memberId = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
	return memberId ? guild.members.fetch(memberId[1] as Snowflake).catch(() => null) : null;
}

async function resolveByQuery(argument: string, guild: Guild): Promise<GuildMember | null> {
	argument = argument.length > 5 && argument.at(-5) === '#' ? argument.slice(0, -5) : argument;

	const members = await guild.members.fetch({ query: argument, limit: 1 }).catch(() => null);
	return members?.first() ?? null;
}
