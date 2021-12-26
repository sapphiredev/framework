import type { CommandInteraction, ContextMenuInteraction, Message, TextBasedChannel } from 'discord.js';
import type { Command, CommandOptions } from '../lib/structures/Command';
import { AllFlowsPrecondition, PreconditionContext } from '../lib/structures/Precondition';

const guildTypes: CommandOptionsRunType[] = ['GUILD_NEWS', 'GUILD_TEXT'];
const threadTypes: CommandOptionsRunType[] = ['GUILD_PRIVATE_THREAD', 'GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD'];

export interface ChannelTypePreconditionContext extends PreconditionContext {
	allowedTypes: readonly (CommandOptionsRunType | CommandOptionsRunTypeEnum)[];
	guild?: boolean;
	thread?: boolean;
}

/**
 * The allowed values for {@link Command.Options.runIn}.
 * @remark It is discouraged to use this type, we recommend using {@link Command.OptionsRunTypeEnum} instead.
 * @since 2.0.0
 */
export type CommandOptionsRunType =
	| 'DM'
	| 'GUILD_TEXT'
	| 'GUILD_NEWS'
	| 'GUILD_NEWS_THREAD'
	| 'GUILD_PUBLIC_THREAD'
	| 'GUILD_PRIVATE_THREAD'
	| 'GUILD_ANY'
	| 'THREAD_ANY';

/**
 * The allowed values for {@link Command.Options.runIn} as an enum.
 * @since 2.0.0
 */

export const enum CommandOptionsRunTypeEnum {
	Dm = 'DM',
	GuildText = 'GUILD_TEXT',
	GuildNews = 'GUILD_NEWS',
	GuildNewsThread = 'GUILD_NEWS_THREAD',
	GuildPublicThread = 'GUILD_PUBLIC_THREAD',
	GuildPrivateThread = 'GUILD_PRIVATE_THREAD',
	GuildAny = 'GUILD_ANY',
	ThreadAny = 'THREAD_ANY'
}

export class CorePrecondition extends AllFlowsPrecondition {
	public parseCommandOptions({ runIn }: CommandOptions): ChannelTypePreconditionContext | null {
		if (!runIn) return null;

		if (typeof runIn === 'string')
			return {
				allowedTypes: [runIn],
				guild: runIn === 'GUILD_ANY',
				thread: runIn === 'THREAD_ANY'
			};

		if (runIn.length === 1)
			return {
				allowedTypes: runIn,
				guild: runIn.includes('GUILD_ANY'),
				thread: runIn.includes('THREAD_ANY')
			};

		const allowedTypes = new Set(runIn);
		let thread = false;
		let guild = false;

		if (threadTypes.every((channelType) => allowedTypes.has(channelType))) {
			threadTypes.forEach((channelType) => allowedTypes.delete(channelType));
			allowedTypes.add('THREAD_ANY');
			thread = true;
		} else if (allowedTypes.has('THREAD_ANY')) thread = true;

		if (thread && guildTypes.every((channelType) => allowedTypes.has(channelType))) {
			guildTypes.forEach((channelType) => allowedTypes.delete(channelType));
			allowedTypes.add('GUILD_ANY');
			guild = true;
		} else if (allowedTypes.has('GUILD_ANY')) guild = true;

		if (allowedTypes.has('GUILD_ANY') && allowedTypes.has('DM')) return null;

		return { allowedTypes: Array.from(allowedTypes), guild, thread };
	}

	public messageRun(message: Message, _command: Command, context: ChannelTypePreconditionContext) {
		if (context.guild && message.guild) return this.ok();

		return this.sharedRun(context, message.channel);
	}

	public async contextMenuRun(interaction: ContextMenuInteraction, _command: Command, context: ChannelTypePreconditionContext) {
		if (context.guild && interaction.inGuild()) return this.ok();

		const channel = await this.fetchChannelFromInteraction(interaction);
		return this.sharedRun(context, channel);
	}

	public async chatInputRun(interaction: CommandInteraction, _command: Command, context: ChannelTypePreconditionContext) {
		if (context.guild && interaction.inGuild()) return this.ok();

		const channel = await this.fetchChannelFromInteraction(interaction);
		return this.sharedRun(context, channel);
	}

	public sharedRun(context: ChannelTypePreconditionContext, channel: TextBasedChannel) {
		if (context.thread && channel.isThread()) return this.ok();

		if (context.allowedTypes.includes(channel.type)) return this.ok();

		return this.error();
	}
}
