import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { Guild, GuildMember, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

const memberWithDiscriminatorRegex = /#\d{4}$/;

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
	const queryDiscriminator = memberWithDiscriminatorRegex.test(argument);
	if (queryDiscriminator) {
		argument = argument.substring(0, -4);
	}

	const members = await guild.members.fetch({ query: argument, limit: 1 }).catch(() => null);
	return members?.first() ?? null;
}
