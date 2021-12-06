import type { Piece, Store } from '@sapphire/pieces';
import { Constants, Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Args } from '../parsers/Args';
import type { Command } from '../structures/Command';
import type { Listener } from '../structures/Listener';
import type { PluginHook } from './Enums';

export const Events = {
	// #region Discord.js base events
	ChannelCreate: Constants.Events.CHANNEL_CREATE,
	ChannelDelete: Constants.Events.CHANNEL_DELETE,
	ChannelPinsUpdate: Constants.Events.CHANNEL_PINS_UPDATE,
	ChannelUpdate: Constants.Events.CHANNEL_UPDATE,
	ClientReady: Constants.Events.CLIENT_READY,
	Debug: Constants.Events.DEBUG,
	Error: Constants.Events.ERROR,
	GuildBanAdd: Constants.Events.GUILD_BAN_ADD,
	GuildBanRemove: Constants.Events.GUILD_BAN_REMOVE,
	GuildCreate: Constants.Events.GUILD_CREATE,
	GuildDelete: Constants.Events.GUILD_DELETE,
	GuildEmojiCreate: Constants.Events.GUILD_EMOJI_CREATE,
	GuildEmojiDelete: Constants.Events.GUILD_EMOJI_DELETE,
	GuildEmojiUpdate: Constants.Events.GUILD_EMOJI_UPDATE,
	GuildIntegrationsUpdate: Constants.Events.GUILD_INTEGRATIONS_UPDATE,
	GuildMemberAdd: Constants.Events.GUILD_MEMBER_ADD,
	GuildMemberAvailable: Constants.Events.GUILD_MEMBER_AVAILABLE,
	GuildMemberRemove: Constants.Events.GUILD_MEMBER_REMOVE,
	GuildMemberUpdate: Constants.Events.GUILD_MEMBER_UPDATE,
	GuildMembersChunk: Constants.Events.GUILD_MEMBERS_CHUNK,
	GuildRoleCreate: Constants.Events.GUILD_ROLE_CREATE,
	GuildRoleDelete: Constants.Events.GUILD_ROLE_DELETE,
	GuildRoleUpdate: Constants.Events.GUILD_ROLE_UPDATE,
	GuildUnavailable: Constants.Events.GUILD_UNAVAILABLE,
	GuildUpdate: Constants.Events.GUILD_UPDATE,
	Invalidated: Constants.Events.INVALIDATED,
	InviteCreate: Constants.Events.INVITE_CREATE,
	InviteDelete: Constants.Events.INVITE_DELETE,
	MessageBulkDelete: Constants.Events.MESSAGE_BULK_DELETE,
	MessageCreate: Constants.Events.MESSAGE_CREATE,
	MessageDelete: Constants.Events.MESSAGE_DELETE,
	MessageReactionAdd: Constants.Events.MESSAGE_REACTION_ADD,
	MessageReactionRemoveAll: Constants.Events.MESSAGE_REACTION_REMOVE_ALL,
	MessageReactionRemove: Constants.Events.MESSAGE_REACTION_REMOVE,
	MessageUpdate: Constants.Events.MESSAGE_UPDATE,
	PresenceUpdate: Constants.Events.PRESENCE_UPDATE,
	RateLimit: Constants.Events.RATE_LIMIT,
	Raw: Constants.Events.RAW,
	ShardDisconnect: Constants.Events.SHARD_DISCONNECT,
	ShardError: Constants.Events.SHARD_ERROR,
	ShardReady: Constants.Events.SHARD_READY,
	ShardReconnecting: Constants.Events.SHARD_RECONNECTING,
	ShardResume: Constants.Events.SHARD_RESUME,
	TypingStart: Constants.Events.TYPING_START,
	UserUpdate: Constants.Events.USER_UPDATE,
	VoiceStateUpdate: Constants.Events.VOICE_STATE_UPDATE,
	Warn: Constants.Events.WARN,
	WebhooksUpdate: Constants.Events.WEBHOOKS_UPDATE,
	// #endregion Discord.js base events

	// #region Sapphire load cycle events
	CommandAccepted: 'commandAccepted' as const,
	CommandDenied: 'commandDenied' as const,
	CommandError: 'commandError' as const,
	CommandFinish: 'commandFinish' as const,
	CommandRun: 'commandRun' as const,
	CommandSuccess: 'commandSuccess' as const,
	CommandTypingError: 'commandTypingError' as const,
	ListenerError: 'listenerError' as const,
	MentionPrefixOnly: 'mentionPrefixOnly' as const,
	NonPrefixedMessage: 'nonPrefixedMessage' as const,
	PiecePostLoad: 'piecePostLoad' as const,
	PieceUnload: 'pieceUnload' as const,
	PluginLoaded: 'pluginLoaded' as const,
	PreCommandRun: 'preCommandRun' as const,
	PrefixedMessage: 'prefixedMessage' as const,
	PreMessageParsed: 'preMessageParsed' as const,
	UnknownCommand: 'unknownCommand' as const,
	UnknownCommandName: 'unknownCommandName' as const
	// #endregion Sapphire load cycle events
};

export interface IPieceError {
	piece: Piece;
}

export interface ListenerErrorPayload extends IPieceError {
	piece: Listener;
}

export interface UnknownCommandNamePayload {
	message: Message;
	prefix: string | RegExp;
	commandPrefix: string;
}

export interface UnknownCommandPayload extends UnknownCommandNamePayload {
	commandName: string;
}

export interface ICommandPayload {
	message: Message;
	command: Command;
}

export interface PreCommandRunPayload extends CommandDeniedPayload {}

export interface CommandDeniedPayload extends ICommandPayload {
	parameters: string;
	context: Command.RunContext;
}

export interface CommandAcceptedPayload extends ICommandPayload {
	parameters: string;
	context: Command.RunContext;
}

export interface CommandRunPayload<T extends Args = Args> extends CommandAcceptedPayload {
	args: T;
}

export interface CommandFinishPayload<T extends Args = Args> extends CommandRunPayload<T> {}

export interface CommandErrorPayload<T extends Args = Args> extends CommandRunPayload<T> {
	piece: Command;
}

export interface CommandSuccessPayload<T extends Args = Args> extends CommandRunPayload<T> {
	result: unknown;
}

export interface CommandTypingErrorPayload<T extends Args = Args> extends CommandRunPayload<T> {}

declare module 'discord.js' {
	interface ClientEvents {
		// #region Sapphire load cycle events
		[Events.PieceUnload]: [store: Store<Piece>, piece: Piece];
		[Events.PiecePostLoad]: [store: Store<Piece>, piece: Piece];
		[Events.MentionPrefixOnly]: [message: Message];
		[Events.ListenerError]: [error: unknown, payload: ListenerErrorPayload];
		[Events.PreMessageParsed]: [message: Message];
		[Events.PrefixedMessage]: [message: Message, prefix: string | RegExp];
		[Events.UnknownCommandName]: [payload: UnknownCommandNamePayload];
		[Events.UnknownCommand]: [payload: UnknownCommandPayload];
		[Events.PreCommandRun]: [payload: PreCommandRunPayload];
		[Events.CommandDenied]: [error: UserError, payload: CommandDeniedPayload];
		[Events.CommandAccepted]: [payload: CommandAcceptedPayload];
		[Events.CommandRun]: [message: Message, command: Command, payload: CommandRunPayload];
		[Events.CommandSuccess]: [payload: CommandSuccessPayload];
		[Events.CommandError]: [error: unknown, payload: CommandErrorPayload];
		[Events.CommandFinish]: [message: Message, command: Command, payload: CommandFinishPayload];
		[Events.CommandTypingError]: [error: unknown, payload: CommandTypingErrorPayload];
		[Events.PluginLoaded]: [hook: PluginHook, name: string | undefined];
		[Events.NonPrefixedMessage]: [message: Message];
		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
