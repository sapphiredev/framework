import type { Piece, Store } from '@sapphire/pieces';
import { Constants, Interaction, Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Args } from '../parsers/Args';
import type { Command, MessageCommand, MessageCommandContext } from '../structures/Command';
import type { InteractionHandler } from '../structures/InteractionHandler';
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
	GuildMembersChunk: Constants.Events.GUILD_MEMBERS_CHUNK,
	GuildMemberUpdate: Constants.Events.GUILD_MEMBER_UPDATE,
	GuildRoleCreate: Constants.Events.GUILD_ROLE_CREATE,
	GuildRoleDelete: Constants.Events.GUILD_ROLE_DELETE,
	GuildRoleUpdate: Constants.Events.GUILD_ROLE_UPDATE,
	GuildStickerCreate: Constants.Events.GUILD_STICKER_CREATE,
	GuildStickerDelete: Constants.Events.GUILD_STICKER_DELETE,
	GuildStickerUpdate: Constants.Events.GUILD_STICKER_UPDATE,
	GuildUnavailable: Constants.Events.GUILD_UNAVAILABLE,
	GuildUpdate: Constants.Events.GUILD_UPDATE,
	InteractionCreate: Constants.Events.INTERACTION_CREATE,
	Invalidated: Constants.Events.INVALIDATED,
	InvalidRequestWarning: Constants.Events.INVALID_REQUEST_WARNING,
	InviteCreate: Constants.Events.INVITE_CREATE,
	InviteDelete: Constants.Events.INVITE_DELETE,
	MessageBulkDelete: Constants.Events.MESSAGE_BULK_DELETE,
	MessageCreate: Constants.Events.MESSAGE_CREATE,
	MessageDelete: Constants.Events.MESSAGE_DELETE,
	MessageReactionAdd: Constants.Events.MESSAGE_REACTION_ADD,
	MessageReactionRemove: Constants.Events.MESSAGE_REACTION_REMOVE,
	MessageReactionRemoveAll: Constants.Events.MESSAGE_REACTION_REMOVE_ALL,
	MessageReactionRemoveEmoji: Constants.Events.MESSAGE_REACTION_REMOVE_EMOJI,
	MessageUpdate: Constants.Events.MESSAGE_UPDATE,
	PresenceUpdate: Constants.Events.PRESENCE_UPDATE,
	RateLimit: Constants.Events.RATE_LIMIT,
	Raw: Constants.Events.RAW,
	ShardDisconnect: Constants.Events.SHARD_DISCONNECT,
	ShardError: Constants.Events.SHARD_ERROR,
	ShardReady: Constants.Events.SHARD_READY,
	ShardReconnecting: Constants.Events.SHARD_RECONNECTING,
	ShardResume: Constants.Events.SHARD_RESUME,
	StageInstanceCreate: Constants.Events.STAGE_INSTANCE_CREATE,
	StageInstanceDelete: Constants.Events.STAGE_INSTANCE_DELETE,
	StageInstanceUpdate: Constants.Events.STAGE_INSTANCE_UPDATE,
	ThreadCreate: Constants.Events.THREAD_CREATE,
	ThreadDelete: Constants.Events.THREAD_DELETE,
	ThreadListSync: Constants.Events.THREAD_LIST_SYNC,
	ThreadMembersUpdate: Constants.Events.THREAD_MEMBERS_UPDATE,
	ThreadMemberUpdate: Constants.Events.THREAD_MEMBER_UPDATE,
	ThreadUpdate: Constants.Events.THREAD_UPDATE,
	TypingStart: Constants.Events.TYPING_START,
	UserUpdate: Constants.Events.USER_UPDATE,
	VoiceServerUpdate: Constants.Events.VOICE_SERVER_UPDATE,
	VoiceStateUpdate: Constants.Events.VOICE_STATE_UPDATE,
	Warn: Constants.Events.WARN,
	WebhooksUpdate: Constants.Events.WEBHOOKS_UPDATE,
	// #endregion Discord.js base events

	// #region Sapphire load cycle events
	MessageCommandAccepted: 'messageCommandAccepted' as const,
	MessageCommandDenied: 'messageCommandDenied' as const,
	MessageCommandError: 'messageCommandError' as const,
	MessageCommandFinish: 'messageCommandFinish' as const,
	MessageCommandRun: 'messageCommandRun' as const,
	MessageCommandSuccess: 'messageCommandSuccess' as const,
	MessageCommandTypingError: 'messageCommandTypingError' as const,
	ListenerError: 'listenerError' as const,
	MentionPrefixOnly: 'mentionPrefixOnly' as const,
	NonPrefixedMessage: 'nonPrefixedMessage' as const,
	PiecePostLoad: 'piecePostLoad' as const,
	PieceUnload: 'pieceUnload' as const,
	PluginLoaded: 'pluginLoaded' as const,
	PreMessageCommandRun: 'preMessageCommandRun' as const,
	PrefixedMessage: 'prefixedMessage' as const,
	PreMessageParsed: 'preMessageParsed' as const,
	UnknownMessageCommand: 'unknownMessageCommand' as const,
	CommandDoesNotHaveMessageCommandHandler: 'commandDoesNotHaveMessageCommandHandler' as const,
	UnknownMessageCommandName: 'unknownMessageCommandName' as const,
	InteractionHandlerParseError: 'interactionHandlerParseError' as const,
	InteractionHandlerError: 'interactionHandlerError' as const
	// #endregion Sapphire load cycle events
};

export interface IPieceError {
	piece: Piece;
}

export interface ListenerErrorPayload extends IPieceError {
	piece: Listener;
}

export interface UnknownMessageCommandNamePayload {
	message: Message;
	prefix: string | RegExp;
	commandPrefix: string;
}

export interface CommandDoesNotHaveMessageCommandHandler {
	message: Message;
	prefix: string | RegExp;
	commandPrefix: string;
	command: Command;
}

export interface UnknownMessageCommandPayload extends UnknownMessageCommandNamePayload {
	commandName: string;
}

export interface IMessageCommandPayload {
	message: Message;
	command: MessageCommand;
}

export interface PreMessageCommandRunPayload extends MessageCommandDeniedPayload {}

export interface MessageCommandDeniedPayload extends IMessageCommandPayload {
	parameters: string;
	context: MessageCommand.Context;
}

export interface MessageCommandAcceptedPayload extends IMessageCommandPayload {
	parameters: string;
	context: MessageCommand.Context;
}

export interface MessageCommandRunPayload<T extends Args = Args> extends MessageCommandAcceptedPayload {
	args: T;
}

export interface MessageCommandFinishPayload<T extends Args = Args> extends MessageCommandRunPayload<T> {}

export interface MessageCommandErrorPayload<T extends Args = Args> extends MessageCommandRunPayload<T> {
	piece: Command;
}

export interface MessageCommandSuccessPayload<T extends Args = Args> extends MessageCommandRunPayload<T> {
	result: unknown;
}

export interface MessageCommandTypingErrorPayload<T extends Args = Args> extends MessageCommandRunPayload<T> {}

export interface IInteractionHandlerPayload {
	interaction: Interaction;
	handler: InteractionHandler;
}

export interface InteractionHandlerParseError extends IInteractionHandlerPayload {}

export interface InteractionHandlerError extends IInteractionHandlerPayload {}

declare module 'discord.js' {
	interface ClientEvents {
		// #region Sapphire load cycle events
		[Events.PieceUnload]: [store: Store<Piece>, piece: Piece];
		[Events.PiecePostLoad]: [store: Store<Piece>, piece: Piece];
		[Events.MentionPrefixOnly]: [message: Message];
		[Events.ListenerError]: [error: unknown, payload: ListenerErrorPayload];
		[Events.PreMessageParsed]: [message: Message];
		[Events.PrefixedMessage]: [message: Message, prefix: string | RegExp];
		[Events.MessageCommandAccepted]: [payload: MessageCommandAcceptedPayload];
		[Events.MessageCommandDenied]: [error: UserError, payload: MessageCommandDeniedPayload];
		[Events.MessageCommandError]: [error: Error, payload: MessageCommandErrorPayload];
		[Events.MessageCommandFinish]: [message: Message, command: Command, payload: MessageCommandFinishPayload];
		[Events.MessageCommandRun]: [message: Message, command: Command, payload: MessageCommandRunPayload];
		[Events.MessageCommandSuccess]: [payload: MessageCommandSuccessPayload];
		[Events.MessageCommandTypingError]: [error: Error, payload: MessageCommandTypingErrorPayload];
		[Events.PreMessageCommandRun]: [payload: PreMessageCommandRunPayload];
		[Events.UnknownMessageCommand]: [payload: UnknownMessageCommandPayload];
		[Events.UnknownMessageCommandName]: [payload: UnknownMessageCommandNamePayload];
		[Events.CommandDoesNotHaveMessageCommandHandler]: [payload: CommandDoesNotHaveMessageCommandHandler];
		[Events.PluginLoaded]: [hook: PluginHook, name: string | undefined];
		[Events.NonPrefixedMessage]: [message: Message];
		[Events.InteractionHandlerParseError]: [error: Error, payload: InteractionHandlerParseError];
		[Events.InteractionHandlerError]: [error: Error, payload: InteractionHandlerError];
		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
