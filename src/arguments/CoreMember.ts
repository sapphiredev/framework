import type { PieceContext } from '@sapphire/pieces';
import { Constants, DiscordAPIError, GuildMember } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildMember> {
	public constructor(context: PieceContext) {
		super(context, { name: 'member' });
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<GuildMember> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentMemberMissingGuild', 'The argument must be run on a guild.');
		}

		try {
			return this.ok(await guild.members.fetch(argument));
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === Constants.APIErrors.UNKNOWN_MEMBER) {
				return this.error(argument, 'ArgumentMemberUnknownMember', 'The argument did not resolve to a member.');
			}

			return this.error(argument, 'ArgumentMemberUnknownError', 'The argument found an unexpected error when retrieving a member.');
		}
	}
}
