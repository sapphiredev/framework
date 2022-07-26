import type { Piece, Store } from '@sapphire/pieces';
import { AutocompleteInteraction, CommandInteraction, Events as DJSEvents, ContextMenuCommandInteraction, Interaction, Message } from 'discord.js';
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

export const SapphireEvents = {
	// #region Discord.js base events
	ChannelCreate: DJSEvents.ChannelCreate,
	ChannelDelete: DJSEvents.ChannelDelete,
	ChannelPinsUpdate: DJSEvents.ChannelPinsUpdate,
	ChannelUpdate: DJSEvents.ChannelUpdate,
	ClientReady: DJSEvents.ClientReady,
	Debug: DJSEvents.Debug,
	Error: DJSEvents.Error,
	GuildBanAdd: DJSEvents.GuildBanAdd,
	GuildBanRemove: DJSEvents.GuildBanRemove,
	GuildCreate: DJSEvents.GuildCreate,
	GuildDelete: DJSEvents.GuildDelete,
	GuildEmojiCreate: DJSEvents.GuildEmojiCreate,
	GuildEmojiDelete: DJSEvents.GuildEmojiDelete,
	GuildEmojiUpdate: DJSEvents.GuildEmojiUpdate,
	GuildIntegrationsUpdate: DJSEvents.GuildIntegrationsUpdate,
	GuildMemberAdd: DJSEvents.GuildMemberAdd,
	GuildMemberAvailable: DJSEvents.GuildMemberAvailable,
	GuildMemberRemove: DJSEvents.GuildMemberRemove,
	GuildMembersChunk: DJSEvents.GuildMembersChunk,
	GuildMemberUpdate: DJSEvents.GuildMemberUpdate,
	GuildRoleCreate: DJSEvents.GuildRoleCreate,
	GuildRoleDelete: DJSEvents.GuildRoleDelete,
	GuildRoleUpdate: DJSEvents.GuildRoleUpdate,
	GuildStickerCreate: DJSEvents.GuildStickerCreate,
	GuildStickerDelete: DJSEvents.GuildStickerDelete,
	GuildStickerUpdate: DJSEvents.GuildStickerUpdate,
	GuildUnavailable: DJSEvents.GuildUnavailable,
	GuildUpdate: DJSEvents.GuildUpdate,
	InteractionCreate: DJSEvents.InteractionCreate,
	Invalidated: DJSEvents.Invalidated,
	InviteCreate: DJSEvents.InviteCreate,
	InviteDelete: DJSEvents.InviteDelete,
	MessageBulkDelete: DJSEvents.MessageBulkDelete,
	MessageCreate: DJSEvents.MessageCreate,
	MessageDelete: DJSEvents.MessageDelete,
	MessageReactionAdd: DJSEvents.MessageReactionAdd,
	MessageReactionRemove: DJSEvents.MessageReactionRemove,
	MessageReactionRemoveAll: DJSEvents.MessageReactionRemoveAll,
	MessageReactionRemoveEmoji: DJSEvents.MessageReactionRemoveEmoji,
	MessageUpdate: DJSEvents.MessageUpdate,
	PresenceUpdate: DJSEvents.PresenceUpdate,
	Raw: DJSEvents.Raw,
	ShardDisconnect: DJSEvents.ShardDisconnect,
	ShardError: DJSEvents.ShardError,
	ShardReady: DJSEvents.ShardReady,
	ShardReconnecting: DJSEvents.ShardReconnecting,
	ShardResume: DJSEvents.ShardResume,
	StageInstanceCreate: DJSEvents.StageInstanceCreate,
	StageInstanceDelete: DJSEvents.StageInstanceDelete,
	StageInstanceUpdate: DJSEvents.StageInstanceUpdate,
	ThreadCreate: DJSEvents.ThreadCreate,
	ThreadDelete: DJSEvents.ThreadDelete,
	ThreadListSync: DJSEvents.ThreadUpdate,
	ThreadMembersUpdate: DJSEvents.ThreadMembersUpdate,
	ThreadMemberUpdate: DJSEvents.ThreadMemberUpdate,
	ThreadUpdate: DJSEvents.ThreadUpdate,
	TypingStart: DJSEvents.TypingStart,
	UserUpdate: DJSEvents.UserUpdate,
	VoiceServerUpdate: DJSEvents.VoiceServerUpdate,
	VoiceStateUpdate: DJSEvents.VoiceStateUpdate,
	Warn: DJSEvents.Warn,
	WebhooksUpdate: DJSEvents.WebhooksUpdate,
	// #endregion Discord.js base events

	// #region Sapphire events
	// Message commands chain
	/**
	 * Emitted when a message is created that was not sent by bots or webhooks.
	 * @param {Message} message The created message
	 */
	PreMessageParsed: 'preMessageParsed' as const,
	/**
	 * Emitted when a message is created consisting of only the bot's mention.
	 * @param {Message} message The created message
	 */
	MentionPrefixOnly: 'mentionPrefixOnly' as const,
	/**
	 * Emitted when a message is created that does not start with a valid prefix.
	 * @param {Message} message The created message
	 */
	NonPrefixedMessage: 'nonPrefixedMessage' as const,
	/**
	 * Emitted when a message is created that does starts with a valid prefix.
	 * @param {Message} message The created message
	 */
	PrefixedMessage: 'prefixedMessage' as const,

	/**
	 * Emitted when a message starts with a valid prefix but does not include a command name.
	 * @param {UnknownMessageCommandNamePayload} payload
	 */
	UnknownMessageCommandName: 'unknownMessageCommandName' as const,
	/**
	 * Emitted when the name of a sent message command does not match any loaded commands.
	 * @param {UnknownMessageCommandPayload} payload The contextual payload
	 */
	UnknownMessageCommand: 'unknownMessageCommand' as const,
	/**
	 * Emitted when a message command is executed but a `messageRun` method is not found.
	 * @param {CommandDoesNotHaveMessageCommandHandler} payload The contextual payload
	 */
	CommandDoesNotHaveMessageCommandHandler: 'commandDoesNotHaveMessageCommandHandler' as const,
	/**
	 * Emitted before the `messageRun` method of a command is run.
	 * @param {PreMessageCommandRunPayload} payload The contextual payload
	 */
	PreMessageCommandRun: 'preMessageCommandRun' as const,

	/**
	 * Emitted when a precondition denies a message command from being run.
	 * @param {UserError} error The error reported by the precondition
	 * @param {MessageCommandDeniedPayload} payload The contextual payload
	 */
	MessageCommandDenied: 'messageCommandDenied' as const,
	/**
	 * Emitted when a message command passes all precondition checks, if any.
	 * @param {MessageCommandAcceptedPayload} payload The contextual payload
	 */
	MessageCommandAccepted: 'messageCommandAccepted' as const,

	/**
	 * Emitted directly before a message command is run.
	 * @param {Message} message The message that executed the command
	 * @param {Command} command The command that is being run
	 * @param {MessageCommandRunPayload} payload The contextual payload
	 */
	MessageCommandRun: 'messageCommandRun' as const,
	/**
	 * Emitted after a message command runs successfully.
	 * @param {MessageCommandSuccessPayload} payload The contextual payload
	 */
	MessageCommandSuccess: 'messageCommandSuccess' as const,
	/**
	 * Emitted after a message command runs unsuccesfully.
	 * @param {*} error The error that was thrown
	 * @param {MessageCommandErrorPayload} payload The contextual payload
	 */
	MessageCommandError: 'messageCommandError' as const,
	/**
	 * Emitted directly after a message command finished running, regardless of the outcome.
	 * @param {Message} message The message that executed the command
	 * @param {Command} command The command that finished running
	 * @param {MessageCommandFinishPayload} payload The contextual payload
	 */
	MessageCommandFinish: 'messageCommandFinish' as const,

	/**
	 * Emitted after the bot unsuccessfully tried to start typing when a command is executed.
	 * @param error The error that was thrown
	 * @param payload The contextual payload
	 */
	MessageCommandTypingError: 'messageCommandTypingError' as const,

	// Listener errors
	/**
	 * Emitted when an error is encountered when executing a listener.
	 * @param {*} error The error that was thrown
	 * @param {ListenerErrorPayload} payload The contextual payload
	 */
	ListenerError: 'listenerError' as const,

	// Registry errors
	/**
	 * Emitted when an error is encountered when handling the command application command registry.
	 * @param {*} error The error that was thrown
	 * @param {Command} command The command who's registry caused the error
	 */
	CommandApplicationCommandRegistryError: 'commandApplicationCommandRegistryError' as const,

	// Piece store?
	/**
	 * Emitted after a piece is loaded.
	 * @param {Store<Piece>} store The store in which the piece belongs to
	 * @param {Piece} piece The piece that was loaded
	 */
	PiecePostLoad: 'piecePostLoad' as const,
	/**
	 * Emitted when a piece is unloaded.
	 * @param {Store<Piece>} store The store in which the piece belongs to
	 * @param {Piece} piece The piece that was unloaded
	 */
	PieceUnload: 'pieceUnload' as const,

	// Plugin
	/**
	 * Emitted when a plugin is loaded.
	 * @param {PluginHook} hook The plugin hook that was loaded
	 * @param {string | undefined} name The name of the plugin, if any
	 */
	PluginLoaded: 'pluginLoaded' as const,

	// Interaction handlers
	/**
	 * Emitted when the `parse` method of an interaction handler encounters an error.
	 * @param {*} error The error that was encountered
	 * @param {InteractionHandlerParseError} payload The contextual payload
	 */
	InteractionHandlerParseError: 'interactionHandlerParseError' as const,
	/**
	 * Emitted when an error is encountered when executing an interaction handler.
	 * @param {*} error The error that was encountered
	 * @param {InteractionHandlerError} payload The contextual payload
	 */
	InteractionHandlerError: 'interactionHandlerError' as const,

	// Autocomplete interaction
	/**
	 * Emitted when an autocomplete interaction is recieved.
	 * @param {AutocompleteInteraction} interaction The interaction that was recieved
	 */
	PossibleAutocompleteInteraction: 'possibleAutocompleteInteraction' as const,
	/**
	 * Emitted after an autocomplete interaction handler runs successfully.
	 * @param {AutocompleteInteractionPayload} payload The contextual payload
	 */
	CommandAutocompleteInteractionSuccess: 'commandAutocompleteInteractionSuccess' as const,
	/**
	 * Emitted when an error is encountered when executing an autocomplete interaction handler.
	 * @param {*} error The error that was encountered
	 * @param {AutocompleteInteractionPayload} payload The contextual payload
	 */
	CommandAutocompleteInteractionError: 'commandAutocompleteInteractionError' as const,

	// Chat input command chain
	/**
	 * Emitted when a chat input command interaction is recieved.
	 * @param {CommandInteraction} interaction The interaction that was recieved.
	 */
	PossibleChatInputCommand: 'possibleChatInputCommand' as const,
	/**
	 * Emitted when the name of a sent chat input command does not match any loaded commands.
	 * @param {UnknownChatInputCommandPayload} payload The contextual payload
	 */
	UnknownChatInputCommand: 'unknownChatInputCommand' as const,
	/**
	 * Emitted when a chat input command is executed but a `chatInputRun` method is not found.
	 * @param {CommandDoesNotHaveChatInputCommandHandlerPayload} payload The contextual payload
	 */
	CommandDoesNotHaveChatInputCommandHandler: 'commandDoesNotHaveChatInputCommandHandler' as const,
	/**
	 * Emitted before the `chatInputRun` method of a command is run.
	 * @param {PreChatInputCommandRunPayload} payload The contextual payload
	 */
	PreChatInputCommandRun: 'preChatInputCommandRun' as const,

	/**
	 * Emitted when a precondition denies a chat input command from being run.
	 * @param {UserError} error The error reported by the precondition
	 * @param {ChatInputCommandDeniedPayload} payload The contextual payload
	 */
	ChatInputCommandDenied: 'chatInputCommandDenied' as const,
	/**
	 * Emitted when a chat input command passes all precondition checks, if any.
	 * @param {ChatInputCommandAcceptedPayload} payload The contextual payload
	 */
	ChatInputCommandAccepted: 'chatInputCommandAccepted' as const,

	/**
	 * Emitted directly before a chat input command is run.
	 * @param {CommandInteraction} interaction The interaction that executed the command
	 * @param {ChatInputCommand} command The command that is being run
	 * @param {ChatInputCommandRunPayload} payload The contextual payload
	 */
	ChatInputCommandRun: 'chatInputCommandRun' as const,
	/**
	 * Emitted after a chat input command runs successfully.
	 * @param {ChatInputCommandSuccessPayload} payload The contextual payload
	 */
	ChatInputCommandSuccess: 'chatInputCommandSuccess' as const,
	/**
	 * Emitted after a chat input command runs unsuccesfully.
	 * @param {*} error The error that was thrown
	 * @param {ChatInputCommandErrorPayload} payload The contextual payload
	 */
	ChatInputCommandError: 'chatInputCommandError' as const,
	/**
	 * Emitted directly after a chat input command finished running, regardless of the outcome.
	 * @param {Interaction} interaction The interaction that executed the command
	 * @param {ChatInputCommand} command The command that finished running
	 * @param {ChatInputCommandFinishPayload} payload The contextual payload
	 */
	ChatInputCommandFinish: 'chatInputCommandFinish' as const,

	// Context menu chain
	/**
	 * Emitted when a context menu interaction is recieved.
	 * @param {ContextMenuCommandInteraction} interaction The interaction that was recieved.
	 */
	PossibleContextMenuCommand: 'possibleContextMenuCommand' as const,
	/**
	 * Emitted when the name of a sent context menu command does not match any loaded commands.
	 * @param {UnknownContextMenuCommandPayload} payload The contextual payload
	 */
	UnknownContextMenuCommand: 'unknownContextMenuCommand' as const,
	/**
	 * Emitted when a chat input command is executed but a `contextMenuRun` method is not found.
	 * @param {CommandDoesNotHaveContextMenuCommandHandlerPayload} payload The contextual payload
	 */
	CommandDoesNotHaveContextMenuCommandHandler: 'commandDoesNotHaveContextMenuCommandHandler' as const,
	/**
	 * Emitted before the `contextMenuRun` method of a command is run.
	 * @param {PreContextMenuCommandRunPayload} payload The contextual payload
	 */
	PreContextMenuCommandRun: 'preContextMenuCommandRun' as const,

	/**
	 * Emitted when a precondition denies a context menu command from being run.
	 * @param {UserError} error The error reported by the precondition
	 * @param {ContextMenuCommandDeniedPayload} payload The contextual payload
	 */
	ContextMenuCommandDenied: 'contextMenuCommandDenied' as const,
	/**
	 * Emitted when a context menu command passes all precondition checks, if any.
	 * @param {ContextMenuCommandAcceptedPayload} payload The contextual payload
	 */
	ContextMenuCommandAccepted: 'contextMenuCommandAccepted' as const,

	/**
	 * Emitted directly before a context menu command is run.
	 * @param {ContextMenuCommandInteraction} interaction The interaction that executed the command
	 * @param {ContextMenuCommand} command The command that is being run
	 * @param {ContextMenuCommandRunPayload} payload The contextual payload
	 */
	ContextMenuCommandRun: 'contextMenuCommandRun' as const,
	/**
	 * Emitted after a context menu command runs successfully.
	 * @param {ContextMenuCommandSuccessPayload} payload The contextual payload
	 */
	ContextMenuCommandSuccess: 'contextMenuCommandSuccess' as const,
	/**
	 * Emitted after a context menu command runs unsuccesfully.
	 * @param {*} error The error that was thrown
	 * @param {ContextMenuCommandErrorPayload} payload The contextual payload
	 */
	ContextMenuCommandError: 'contextMenuCommandError' as const,
	/**
	 * Emitted directly after a context menu command finished running, regardless of the outcome.
	 * @param {Interaction} interaction The interaction that executed the command
	 * @param {ContextMenuCommand} command The command that finished running
	 * @param {ContextMenuCommandFinishPayload} payload The contextual payload
	 */
	ContextMenuCommandFinish: 'contextMenuCommandFinish' as const

	// #endregion Sapphire events
};

export { SapphireEvents as Events };

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

export interface MessageCommandFinishPayload extends MessageCommandRunPayload {
	success: boolean;
	duration: number;
}

export interface MessageCommandErrorPayload extends MessageCommandRunPayload {
	duration: number;
}

export interface MessageCommandSuccessPayload extends MessageCommandRunPayload {
	result: unknown;
	duration: number;
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
}

export interface PreChatInputCommandRunPayload extends IChatInputCommandPayload {
	context: ChatInputCommandContext;
}

export interface ChatInputCommandDeniedPayload extends IChatInputCommandPayload {
	context: ChatInputCommandContext;
}

export interface ChatInputCommandAcceptedPayload extends PreChatInputCommandRunPayload {}

export interface ChatInputCommandRunPayload extends ChatInputCommandAcceptedPayload {}

export interface ChatInputCommandFinishPayload extends ChatInputCommandAcceptedPayload {
	success: boolean;
	duration: number;
}

export interface ChatInputCommandSuccessPayload extends ChatInputCommandRunPayload {
	result: unknown;
	duration: number;
}

export interface ChatInputCommandErrorPayload extends IChatInputCommandPayload {
	duration: number;
}

export interface UnknownContextMenuCommandPayload {
	interaction: ContextMenuCommandInteraction;
	context: ContextMenuCommandContext;
}

export interface CommandDoesNotHaveContextMenuCommandHandlerPayload {
	interaction: ContextMenuCommandInteraction;
	context: ContextMenuCommandContext;
	command: Command;
}

export interface IContextMenuCommandPayload {
	interaction: ContextMenuCommandInteraction;
	command: ContextMenuCommand;
}

export interface PreContextMenuCommandRunPayload extends IContextMenuCommandPayload {
	context: ContextMenuCommandContext;
}

export interface ContextMenuCommandDeniedPayload extends IContextMenuCommandPayload {
	context: ContextMenuCommandContext;
}

export interface ContextMenuCommandAcceptedPayload extends PreContextMenuCommandRunPayload {}

export interface ContextMenuCommandRunPayload extends ContextMenuCommandAcceptedPayload {}

export interface ContextMenuCommandFinishPayload extends ContextMenuCommandAcceptedPayload {
	success: boolean;
	duration: number;
}

export interface ContextMenuCommandSuccessPayload extends ContextMenuCommandRunPayload {
	result: unknown;
	duration: number;
}

export interface ContextMenuCommandErrorPayload extends IContextMenuCommandPayload {
	duration: number;
}

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
		[SapphireEvents.PieceUnload]: [store: Store<Piece>, piece: Piece];
		[SapphireEvents.PiecePostLoad]: [store: Store<Piece>, piece: Piece];

		[SapphireEvents.ListenerError]: [error: unknown, payload: ListenerErrorPayload];
		[SapphireEvents.CommandApplicationCommandRegistryError]: [error: unknown, command: Command];

		[SapphireEvents.PreMessageParsed]: [message: Message];
		[SapphireEvents.MentionPrefixOnly]: [message: Message];
		[SapphireEvents.NonPrefixedMessage]: [message: Message];
		[SapphireEvents.PrefixedMessage]: [message: Message, prefix: string | RegExp];

		[SapphireEvents.UnknownMessageCommandName]: [payload: UnknownMessageCommandNamePayload];
		[SapphireEvents.UnknownMessageCommand]: [payload: UnknownMessageCommandPayload];
		[SapphireEvents.CommandDoesNotHaveMessageCommandHandler]: [payload: CommandDoesNotHaveMessageCommandHandler];
		[SapphireEvents.PreMessageCommandRun]: [payload: PreMessageCommandRunPayload];

		[SapphireEvents.MessageCommandDenied]: [error: UserError, payload: MessageCommandDeniedPayload];
		[SapphireEvents.MessageCommandAccepted]: [payload: MessageCommandAcceptedPayload];

		[SapphireEvents.MessageCommandRun]: [message: Message, command: Command, payload: MessageCommandRunPayload];
		[SapphireEvents.MessageCommandSuccess]: [payload: MessageCommandSuccessPayload];
		[SapphireEvents.MessageCommandError]: [error: unknown, payload: MessageCommandErrorPayload];
		[SapphireEvents.MessageCommandFinish]: [message: Message, command: Command, payload: MessageCommandFinishPayload];

		[SapphireEvents.MessageCommandTypingError]: [error: Error, payload: MessageCommandTypingErrorPayload];

		[SapphireEvents.PluginLoaded]: [hook: PluginHook, name: string | undefined];

		[SapphireEvents.InteractionHandlerParseError]: [error: unknown, payload: InteractionHandlerParseError];
		[SapphireEvents.InteractionHandlerError]: [error: unknown, payload: InteractionHandlerError];

		[SapphireEvents.PossibleAutocompleteInteraction]: [interaction: AutocompleteInteraction];
		[SapphireEvents.CommandAutocompleteInteractionError]: [error: unknown, payload: AutocompleteInteractionPayload];
		[SapphireEvents.CommandAutocompleteInteractionSuccess]: [payload: AutocompleteInteractionPayload];

		// Chat input command chain
		[SapphireEvents.PossibleChatInputCommand]: [interaction: CommandInteraction];
		[SapphireEvents.UnknownChatInputCommand]: [payload: UnknownChatInputCommandPayload];
		[SapphireEvents.CommandDoesNotHaveChatInputCommandHandler]: [payload: CommandDoesNotHaveChatInputCommandHandlerPayload];
		[SapphireEvents.PreChatInputCommandRun]: [payload: PreChatInputCommandRunPayload];

		[SapphireEvents.ChatInputCommandDenied]: [error: UserError, payload: ChatInputCommandDeniedPayload];
		[SapphireEvents.ChatInputCommandAccepted]: [payload: ChatInputCommandAcceptedPayload];

		[SapphireEvents.ChatInputCommandRun]: [interaction: CommandInteraction, command: ChatInputCommand, payload: ChatInputCommandRunPayload];
		[SapphireEvents.ChatInputCommandSuccess]: [payload: ChatInputCommandSuccessPayload];
		[SapphireEvents.ChatInputCommandError]: [error: unknown, payload: ChatInputCommandErrorPayload];
		[SapphireEvents.ChatInputCommandFinish]: [interaction: CommandInteraction, command: ChatInputCommand, payload: ChatInputCommandFinishPayload];

		// Context menu command chain
		[SapphireEvents.PossibleContextMenuCommand]: [interaction: ContextMenuCommandInteraction];
		[SapphireEvents.UnknownContextMenuCommand]: [payload: UnknownContextMenuCommandPayload];
		[SapphireEvents.CommandDoesNotHaveContextMenuCommandHandler]: [payload: CommandDoesNotHaveContextMenuCommandHandlerPayload];
		[SapphireEvents.PreContextMenuCommandRun]: [payload: PreContextMenuCommandRunPayload];

		[SapphireEvents.ContextMenuCommandDenied]: [error: UserError, payload: ContextMenuCommandDeniedPayload];
		[SapphireEvents.ContextMenuCommandAccepted]: [payload: ContextMenuCommandAcceptedPayload];

		[SapphireEvents.ContextMenuCommandRun]: [
			interaction: ContextMenuCommandInteraction,
			command: ContextMenuCommand,
			payload: ContextMenuCommandRunPayload
		];
		[SapphireEvents.ContextMenuCommandSuccess]: [payload: ContextMenuCommandSuccessPayload];
		[SapphireEvents.ContextMenuCommandError]: [error: unknown, payload: ContextMenuCommandErrorPayload];
		[SapphireEvents.ContextMenuCommandFinish]: [
			interaction: ContextMenuCommandInteraction,
			command: ContextMenuCommand,
			payload: ContextMenuCommandFinishPayload
		];

		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
