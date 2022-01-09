import type { Piece, Store } from '@sapphire/pieces';
import { AutocompleteInteraction, CommandInteraction, Constants, ContextMenuInteraction, Interaction, Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type {
	AutocompleteCommand,
	AutocompleteCommandContext,
	ChatInputCommand,
	ChatInputCommandContext,
	Command,
	ContextMenuCommand,
	ContextMenuCommandContext,
	MessageCommand
} from '../structures/Command';
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

	// #region Sapphire events
	// Message commands chain
	PreMessageParsed: 'preMessageParsed' as const,
	MentionPrefixOnly: 'mentionPrefixOnly' as const,
	NonPrefixedMessage: 'nonPrefixedMessage' as const,
	PrefixedMessage: 'prefixedMessage' as const,

	UnknownMessageCommandName: 'unknownMessageCommandName' as const,
	UnknownMessageCommand: 'unknownMessageCommand' as const,
	CommandDoesNotHaveMessageCommandHandler: 'commandDoesNotHaveMessageCommandHandler' as const,
	PreMessageCommandRun: 'preMessageCommandRun' as const,

	MessageCommandDenied: 'messageCommandDenied' as const,
	MessageCommandAccepted: 'messageCommandAccepted' as const,

	MessageCommandRun: 'messageCommandRun' as const,
	MessageCommandSuccess: 'messageCommandSuccess' as const,
	MessageCommandError: 'messageCommandError' as const,
	MessageCommandFinish: 'messageCommandFinish' as const,

	MessageCommandTypingError: 'messageCommandTypingError' as const,

	// Listener errors
	ListenerError: 'listenerError' as const,

	// Registry errors
	CommandApplicationCommandRegistryError: 'commandApplicationCommandRegistryError' as const,

	// Piece store?
	PiecePostLoad: 'piecePostLoad' as const,
	PieceUnload: 'pieceUnload' as const,

	// Plugin
	PluginLoaded: 'pluginLoaded' as const,

	// Interaction handlers
	InteractionHandlerParseError: 'interactionHandlerParseError' as const,
	InteractionHandlerError: 'interactionHandlerError' as const,

	// Autocomplete interaction
	PossibleAutocompleteInteraction: 'possibleAutocompleteInteraction' as const,
	CommandAutocompleteInteractionSuccess: 'commandAutocompleteInteractionSuccess' as const,
	CommandAutocompleteInteractionError: 'commandAutocompleteInteractionError' as const,

	// Chat input command chain
	PossibleChatInputCommand: 'possibleChatInputCommand' as const,
	UnknownChatInputCommand: 'unknownChatInputCommand' as const,
	CommandDoesNotHaveChatInputCommandHandler: 'commandDoesNotHaveChatInputCommandHandler' as const,
	PreChatInputCommandRun: 'preChatInputCommandRun' as const,

	ChatInputCommandDenied: 'chatInputCommandDenied' as const,
	ChatInputCommandAccepted: 'chatInputCommandAccepted' as const,

	ChatInputCommandRun: 'chatInputCommandRun' as const,
	ChatInputCommandSuccess: 'chatInputCommandSuccess' as const,
	ChatInputCommandError: 'chatInputCommandError' as const,
	ChatInputCommandFinish: 'chatInputCommandFinish' as const,

	// Context menu chain
	PossibleContextMenuCommand: 'possibleContextMenuCommand' as const,
	UnknownContextMenuCommand: 'unknownContextMenuCommand' as const,
	CommandDoesNotHaveContextMenuCommandHandler: 'commandDoesNotHaveContextMenuCommandHandler' as const,
	PreContextMenuCommandRun: 'preContextMenuCommandRun' as const,

	ContextMenuCommandDenied: 'contextMenuCommandDenied' as const,
	ContextMenuCommandAccepted: 'contextMenuCommandAccepted' as const,

	ContextMenuCommandRun: 'contextMenuCommandRun' as const,
	ContextMenuCommandSuccess: 'contextMenuCommandSuccess' as const,
	ContextMenuCommandError: 'contextMenuCommandError' as const,
	ContextMenuCommandFinish: 'contextMenuCommandFinish' as const

	// #endregion Sapphire events
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
	context: MessageCommand.RunContext;
}

export interface MessageCommandAcceptedPayload extends IMessageCommandPayload {
	parameters: string;
	context: MessageCommand.RunContext;
}

export interface MessageCommandRunPayload extends MessageCommandAcceptedPayload {
	args: unknown;
}

export interface MessageCommandFinishPayload extends MessageCommandRunPayload {}

export interface MessageCommandErrorPayload extends MessageCommandRunPayload {}

export interface MessageCommandSuccessPayload extends MessageCommandRunPayload {
	result: unknown;
}

export interface MessageCommandTypingErrorPayload extends MessageCommandRunPayload {}

export interface UnknownChatInputCommandPayload {
	interaction: CommandInteraction;
	context: ChatInputCommandContext;
}

export interface CommandDoesNotHaveChatInputCommandHandlerPayload {
	interaction: CommandInteraction;
	command: Command;
	context: ChatInputCommandContext;
}

export interface IChatInputCommandPayload {
	interaction: CommandInteraction;
	command: ChatInputCommand;
	duration?: number;
}

export interface PreChatInputCommandRunPayload extends IChatInputCommandPayload {
	context: ChatInputCommandContext;
}

export interface ChatInputCommandDeniedPayload extends IChatInputCommandPayload {
	context: ChatInputCommandContext;
}

export interface ChatInputCommandAcceptedPayload extends PreChatInputCommandRunPayload {}

export interface ChatInputCommandRunPayload extends ChatInputCommandAcceptedPayload {}

export interface ChatInputCommandSuccessPayload extends ChatInputCommandRunPayload {
	result: unknown;
}

export interface ChatInputCommandErrorPayload extends IChatInputCommandPayload {}

export interface UnknownContextMenuCommandPayload {
	interaction: ContextMenuInteraction;
	context: ContextMenuCommandContext;
}

export interface CommandDoesNotHaveContextMenuCommandHandlerPayload {
	interaction: ContextMenuInteraction;
	context: ContextMenuCommandContext;
	command: Command;
}

export interface IContextMenuCommandPayload {
	interaction: ContextMenuInteraction;
	command: ContextMenuCommand;
	duration?: number;
}

export interface PreContextMenuCommandRunPayload extends IContextMenuCommandPayload {
	context: ContextMenuCommandContext;
}

export interface ContextMenuCommandDeniedPayload extends IContextMenuCommandPayload {
	context: ContextMenuCommandContext;
}

export interface ContextMenuCommandAcceptedPayload extends PreContextMenuCommandRunPayload {}

export interface ContextMenuCommandRunPayload extends ContextMenuCommandAcceptedPayload {}

export interface ContextMenuCommandSuccessPayload extends ContextMenuCommandRunPayload {
	result: unknown;
}

export interface ContextMenuCommandErrorPayload extends IContextMenuCommandPayload {}

export interface IInteractionHandlerPayload {
	interaction: Interaction;
	handler: InteractionHandler;
}

export interface InteractionHandlerParseError extends IInteractionHandlerPayload {}

export interface InteractionHandlerError extends IInteractionHandlerPayload {}

export interface AutocompleteInteractionPayload {
	interaction: AutocompleteInteraction;
	command: AutocompleteCommand;
	context: AutocompleteCommandContext;
}

declare module 'discord.js' {
	interface ClientEvents {
		// #region Sapphire load cycle events
		[Events.PieceUnload]: [store: Store<Piece>, piece: Piece];
		[Events.PiecePostLoad]: [store: Store<Piece>, piece: Piece];

		[Events.ListenerError]: [error: unknown, payload: ListenerErrorPayload];
		[Events.CommandApplicationCommandRegistryError]: [error: unknown, command: Command];

		[Events.PreMessageParsed]: [message: Message];
		[Events.MentionPrefixOnly]: [message: Message];
		[Events.NonPrefixedMessage]: [message: Message];
		[Events.PrefixedMessage]: [message: Message, prefix: string | RegExp];

		[Events.UnknownMessageCommandName]: [payload: UnknownMessageCommandNamePayload];
		[Events.UnknownMessageCommand]: [payload: UnknownMessageCommandPayload];
		[Events.CommandDoesNotHaveMessageCommandHandler]: [payload: CommandDoesNotHaveMessageCommandHandler];
		[Events.PreMessageCommandRun]: [payload: PreMessageCommandRunPayload];

		[Events.MessageCommandDenied]: [error: UserError, payload: MessageCommandDeniedPayload];
		[Events.MessageCommandAccepted]: [payload: MessageCommandAcceptedPayload];

		[Events.MessageCommandRun]: [message: Message, command: Command, payload: MessageCommandRunPayload];
		[Events.MessageCommandSuccess]: [payload: MessageCommandSuccessPayload];
		[Events.MessageCommandError]: [error: unknown, payload: MessageCommandErrorPayload];
		[Events.MessageCommandFinish]: [message: Message, command: Command, payload: MessageCommandFinishPayload];

		[Events.MessageCommandTypingError]: [error: Error, payload: MessageCommandTypingErrorPayload];

		[Events.PluginLoaded]: [hook: PluginHook, name: string | undefined];

		[Events.InteractionHandlerParseError]: [error: unknown, payload: InteractionHandlerParseError];
		[Events.InteractionHandlerError]: [error: unknown, payload: InteractionHandlerError];

		[Events.PossibleAutocompleteInteraction]: [interaction: AutocompleteInteraction];
		[Events.CommandAutocompleteInteractionError]: [error: unknown, payload: AutocompleteInteractionPayload];
		[Events.CommandAutocompleteInteractionSuccess]: [payload: AutocompleteInteractionPayload];

		// Chat input command chain
		[Events.PossibleChatInputCommand]: [interaction: CommandInteraction];
		[Events.UnknownChatInputCommand]: [payload: UnknownChatInputCommandPayload];
		[Events.CommandDoesNotHaveChatInputCommandHandler]: [payload: CommandDoesNotHaveChatInputCommandHandlerPayload];
		[Events.PreChatInputCommandRun]: [payload: PreChatInputCommandRunPayload];

		[Events.ChatInputCommandDenied]: [error: UserError, payload: ChatInputCommandDeniedPayload];
		[Events.ChatInputCommandAccepted]: [payload: ChatInputCommandAcceptedPayload];

		[Events.ChatInputCommandRun]: [interaction: CommandInteraction, command: ChatInputCommand, payload: ChatInputCommandRunPayload];
		[Events.ChatInputCommandSuccess]: [payload: ChatInputCommandSuccessPayload];
		[Events.ChatInputCommandError]: [error: unknown, payload: ChatInputCommandErrorPayload];
		[Events.ChatInputCommandFinish]: [interaction: CommandInteraction, command: ChatInputCommand, payload: ChatInputCommandRunPayload];

		// Context menu command chain
		[Events.PossibleContextMenuCommand]: [interaction: ContextMenuInteraction];
		[Events.UnknownContextMenuCommand]: [payload: UnknownContextMenuCommandPayload];
		[Events.CommandDoesNotHaveContextMenuCommandHandler]: [payload: CommandDoesNotHaveContextMenuCommandHandlerPayload];
		[Events.PreContextMenuCommandRun]: [payload: PreContextMenuCommandRunPayload];

		[Events.ContextMenuCommandDenied]: [error: UserError, payload: ContextMenuCommandDeniedPayload];
		[Events.ContextMenuCommandAccepted]: [payload: ContextMenuCommandAcceptedPayload];

		[Events.ContextMenuCommandRun]: [interaction: ContextMenuInteraction, command: ContextMenuCommand, payload: ContextMenuCommandRunPayload];
		[Events.ContextMenuCommandSuccess]: [payload: ContextMenuCommandSuccessPayload];
		[Events.ContextMenuCommandError]: [error: unknown, payload: ContextMenuCommandErrorPayload];
		[Events.ContextMenuCommandFinish]: [interaction: ContextMenuInteraction, command: ContextMenuCommand, payload: ContextMenuCommandRunPayload];

		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
