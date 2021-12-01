import type { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { container } from '@sapphire/pieces';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9';
import type {
	ApplicationCommand,
	ApplicationCommandManager,
	ChatInputApplicationCommandData,
	Collection,
	Constants,
	MessageApplicationCommandData,
	UserApplicationCommandData
} from 'discord.js';
import { RegisterBehavior } from '../../types/Enums';
import { CommandDifference, getCommandDifferences } from './computeDifferences';
import { convertApplicationCommandToApiData, normalizeChatInputCommand, normalizeContextMenuCommand } from './normalizeInputs';

export class ApplicationCommandRegistry {
	public readonly commandName: string;

	public readonly chatInputCommands = new Set<string>();
	public readonly contextMenuCommands = new Set<string>();

	private readonly apiCalls: InternalAPICall[] = [];

	public constructor(commandName: string) {
		this.commandName = commandName;
	}

	public get command() {
		return container.stores.get('commands').get(this.commandName);
	}

	public registerChatInputCommand(
		command: ChatInputApplicationCommandData | SlashCommandBuilder | ((builder: SlashCommandBuilder) => SlashCommandBuilder),
		options?: ApplicationCommandRegistryRegisterOptions
	) {
		const builtData = normalizeChatInputCommand(command);

		this.chatInputCommands.add(builtData.name);

		this.apiCalls.push({
			builtData,
			registerOptions: options ?? { registerCommandIfMissing: true, behaviorWhenNotIdentical: RegisterBehavior.LogToConsole },
			type: 'chat_input'
		});

		if (options?.idHints) {
			for (const hint of options.idHints) {
				this.chatInputCommands.add(hint);
			}
		}

		return this;
	}

	public registerContextMenuCommand(
		command:
			| UserApplicationCommandData
			| MessageApplicationCommandData
			| ContextMenuCommandBuilder
			| ((builder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder),
		options?: ApplicationCommandRegistryRegisterOptions
	) {
		const builtData = normalizeContextMenuCommand(command);

		this.contextMenuCommands.add(builtData.name);

		this.apiCalls.push({
			builtData,
			registerOptions: options ?? { registerCommandIfMissing: true, behaviorWhenNotIdentical: RegisterBehavior.LogToConsole },
			type: 'context_menu'
		});

		if (options?.idHints) {
			for (const hint of options.idHints) {
				this.contextMenuCommands.add(hint);
			}
		}

		return this;
	}

	public addChatInputCommandNames(...names: string[] | string[][]) {
		const flattened = names.flat(Infinity) as string[];

		for (const command of flattened) {
			this.debug(`Registering name "${command}" to internal chat input map`);
			this.warn(
				`Registering the chat input command "${command}" using a name is not recommended.`,
				'Please use the "addChatInputCommandIds" method instead with a command id.'
			);
			this.chatInputCommands.add(command);
		}

		return this;
	}

	public addContextMenuCommandNames(...names: string[] | string[][]) {
		const flattened = names.flat(Infinity) as string[];

		for (const command of flattened) {
			this.debug(`Registering name "${command}" to internal context menu map`);
			this.warn(
				`Registering the context menu command "${command}" using a name is not recommended.`,
				'Please use the "addContextMenuCommandIds" method instead with a command id.'
			);
			this.contextMenuCommands.add(command);
		}

		return this;
	}

	public addChatInputCommandIds(...commandIds: string[] | string[][]) {
		const flattened = commandIds.flat(Infinity) as string[];

		for (const entry of flattened) {
			try {
				BigInt(entry);
				this.debug(`Registering id "${entry}" to internal chat input map`);
			} catch {
				// Don't be silly, save yourself the headaches and do as we say
				this.debug(`Registering name "${entry}" to internal chat input map`);
				this.warn(
					`Registering the chat input command "${entry}" using a name *and* trying to bypass this warning by calling "addChatInputCommandIds" is not recommended.`,
					'Please use the "addChatInputCommandIds" method with a valid command id instead.'
				);
			}
			this.chatInputCommands.add(entry);
		}

		return this;
	}

	public addContextMenuCommandIds(...commandIds: string[] | string[][]) {
		const flattened = commandIds.flat(Infinity) as string[];

		for (const entry of flattened) {
			try {
				BigInt(entry);
				this.debug(`Registering id "${entry}" to internal context menu map`);
			} catch {
				this.debug(`Registering name "${entry}" to internal context menu map`);
				// Don't be silly, save yourself the headaches and do as we say
				this.warn(
					`Registering the context menu command "${entry}" using a name *and* trying to bypass this warning by calling "addContextMenuCommandIds" is not recommended.`,
					'Please use the "addContextMenuCommandIds" method with a valid command id instead.'
				);
			}
			this.contextMenuCommands.add(entry);
		}

		return this;
	}

	protected async runAPICalls(
		applicationCommands: ApplicationCommandManager,
		globalCommands: Collection<string, ApplicationCommand>,
		guildCommands: Map<string, Collection<string, ApplicationCommand>>
	) {
		this.debug(`Preparing to process ${this.apiCalls.length} possible command registrations / updates...`);

		await Promise.allSettled(this.apiCalls.map((call) => this.handleAPICall(applicationCommands, globalCommands, guildCommands, call)));
	}

	private async handleAPICall(
		commandsManager: ApplicationCommandManager,
		globalCommands: Collection<string, ApplicationCommand>,
		allGuildsCommands: Map<string, Collection<string, ApplicationCommand>>,
		apiCall: InternalAPICall
	) {
		const { builtData, registerOptions } = apiCall;
		const commandName = builtData.name;
		const behaviorIfNotEqual = registerOptions.behaviorWhenNotIdentical ?? RegisterBehavior.LogToConsole;

		const findCallback = (entry: ApplicationCommand) => {
			// If the command is a chat input command, we need to check if the entry is a chat input command
			if (apiCall.type === 'chat_input' && entry.type !== 'CHAT_INPUT') return false;
			// If the command is a context menu command, we need to check if the entry is a context menu command of the same type
			if (apiCall.type === 'context_menu') {
				if (entry.type === 'CHAT_INPUT') return false;

				let apiCallType: keyof typeof Constants['ApplicationCommandTypes'];

				switch (apiCall.builtData.type) {
					case ApplicationCommandType.Message:
						apiCallType = 'MESSAGE';
						break;
					case ApplicationCommandType.User:
						apiCallType = 'USER';
						break;
					default:
						throw new Error(`Unhandled context command type: ${apiCall.builtData.type}`);
				}

				if (apiCallType !== entry.type) return false;
			}

			// Find the command by name or by id hint (mostly useful for context menus)
			const isInIdHint = registerOptions.idHints?.includes(entry.id);
			return typeof isInIdHint === 'boolean' ? isInIdHint || entry.name === commandName : entry.name === commandName;
		};

		let type: string;

		switch (apiCall.type) {
			case 'chat_input':
				type = 'chat input';
				break;
			case 'context_menu':
				switch (apiCall.builtData.type) {
					case ApplicationCommandType.Message:
						type = 'message context menu';
						break;
					case ApplicationCommandType.User:
						type = 'user context menu';
						break;
					default:
						type = 'unknown-type context menu';
				}
				break;
			default:
				type = 'unknown';
		}

		if (!registerOptions.guildIds) {
			const globalCommand = globalCommands.find(findCallback);

			if (globalCommand) {
				switch (apiCall.type) {
					case 'chat_input':
						this.addChatInputCommandIds(globalCommand.id);
						break;
					case 'context_menu':
						this.addContextMenuCommandIds(globalCommand.id);
						break;
				}

				this.debug(`Checking if command "${commandName}" is identical with global ${type} command with id "${globalCommand.id}"`);
				await this.handleCommandPresent(globalCommand, builtData, behaviorIfNotEqual);
			} else {
				this.debug(`Creating new global ${type} command with name "${commandName}"`);
				await this.createMissingCommand(commandsManager, builtData, type);
			}

			return;
		}

		for (const guildId of registerOptions.guildIds) {
			const guildCommands = allGuildsCommands.get(guildId);

			if (!guildCommands) {
				this.debug(`There are no commands for guild with id "${guildId}". Will create ${type} command "${commandName}".`);
				await this.createMissingCommand(commandsManager, builtData, type, guildId);
				continue;
			}

			const existingGuildCommand = guildCommands.find(findCallback);

			if (existingGuildCommand) {
				this.debug(`Checking if guild ${type} command "${commandName}" is identical to command "${existingGuildCommand.id}"`);

				switch (apiCall.type) {
					case 'chat_input':
						this.addChatInputCommandIds(existingGuildCommand.id);
						break;
					case 'context_menu':
						this.addContextMenuCommandIds(existingGuildCommand.id);
						break;
				}

				await this.handleCommandPresent(existingGuildCommand, builtData, behaviorIfNotEqual);
			} else {
				this.debug(`Creating new guild ${type} command with name "${commandName}" for guild "${guildId}"`);
				await this.createMissingCommand(commandsManager, builtData, type, guildId);
			}
		}
	}

	private async handleCommandPresent(
		applicationCommand: ApplicationCommand,
		apiData: InternalAPICall['builtData'],
		behaviorIfNotEqual: RegisterBehavior,
		guildId?: string
	) {
		const now = Date.now();

		// Step 0: compute differences
		const differences = getCommandDifferences(convertApplicationCommandToApiData(applicationCommand), apiData);

		const later = Date.now() - now;
		this.debug(`Took ${later}ms to process differences`);

		// Step 1: if there are no differences, return
		if (!differences.length) {
			this.debug(
				`${guildId ? 'Guild command' : 'Command'} "${apiData.name}" is identical to command "${applicationCommand.name}" (${
					applicationCommand.id
				})`
			);
			return;
		}

		this.logCommandDifferences(differences, applicationCommand, behaviorIfNotEqual === RegisterBehavior.LogToConsole);

		// Step 2: if the behavior is to log to console, log the differences
		if (behaviorIfNotEqual === RegisterBehavior.LogToConsole) {
			return;
		}

		// Step 3: if the behavior is to update, update the command
		try {
			await applicationCommand.edit(apiData as ChatInputApplicationCommandData);
			this.debug(`Updated command ${applicationCommand.name} (${applicationCommand.id}) with new api data`);
		} catch (error) {
			this.error(`Failed to update command ${applicationCommand.name} (${applicationCommand.id})`, error);
		}
	}

	private logCommandDifferences(differences: CommandDifference[], applicationCommand: ApplicationCommand, logAsWarn: boolean) {
		const finalMessage: string[] = [];

		for (const difference of differences) {
			finalMessage.push(
				[
					`└── At path ${difference.key}`, //
					`     ├── Received: ${difference.original}`,
					`     └── Expected: ${difference.expected}`,
					''
				].join('\n')
			);
		}

		const header = `Found differences for command "${applicationCommand.name}" (${applicationCommand.id}) versus provided api data\n`;

		logAsWarn ? this.warn(header, ...finalMessage) : this.debug(header, ...finalMessage);
	}

	private async createMissingCommand(
		commandsManager: ApplicationCommandManager,
		apiData: InternalAPICall['builtData'],
		type: string,
		guildId?: string
	) {
		try {
			// @ts-expect-error I messed up the overload, PR https://github.com/discordjs/discord.js/pull/6970 needs to be released
			const result = await commandsManager.create(apiData, guildId);

			this.info(
				`Successfully created ${type}${guildId ? ' guild' : ''} command "${apiData.name}" with id "${
					result.id
				}". You should add the id to the "idHints" property of the register method you used!`
			);

			switch (apiData.type) {
				case undefined:
				case ApplicationCommandType.ChatInput:
					this.addChatInputCommandIds(result.id);
					break;
				case ApplicationCommandType.Message:
				case ApplicationCommandType.User:
					this.addContextMenuCommandIds(result.id);
					break;
			}
		} catch (err) {
			this.error(
				`Failed to register${guildId ? ' guild' : ''} application command with name "${apiData.name}"${
					guildId ? ` for guild "${guildId}"` : ''
				}`,
				err
			);
		}
	}

	private info(message: string, ...other: unknown[]) {
		container.logger.info(`ApplicationCommandRegistry[${this.commandName}] ${message}`, ...other);
	}

	private error(message: string, ...other: unknown[]) {
		container.logger.error(`ApplicationCommandRegistry[${this.commandName}] ${message}`, ...other);
	}

	private warn(message: string, ...other: unknown[]) {
		container.logger.warn(`ApplicationCommandRegistry[${this.commandName}] ${message}`, ...other);
	}

	private debug(message: string, ...other: unknown[]) {
		container.logger.debug(`ApplicationCommandRegistry[${this.commandName}] ${message}`, ...other);
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ApplicationCommandRegistry {
	export interface RegisterOptions {
		/**
		 * If this is specified, the application commands will only be registered for these guild ids.
		 */
		guildIds?: string[];
		/**
		 * If we should register the command when it is missing
		 * @default true
		 */
		registerCommandIfMissing?: boolean;
		/**
		 * Specifies what we should do when the command is present, but not identical with the data you provided
		 * @default RegisterBehavior.LogToConsole
		 */
		behaviorWhenNotIdentical?: RegisterBehavior;
		/**
		 * Specifies a list of command ids that we should check in the event of a name mismatch
		 * @default []
		 */
		idHints?: string[];
	}
}

export type ApplicationCommandRegistryRegisterOptions = ApplicationCommandRegistry.RegisterOptions;

export type InternalAPICall =
	| {
			builtData: RESTPostAPIChatInputApplicationCommandsJSONBody;
			registerOptions: ApplicationCommandRegistryRegisterOptions;
			type: 'chat_input';
	  }
	| {
			builtData: RESTPostAPIContextMenuApplicationCommandsJSONBody;
			registerOptions: ApplicationCommandRegistryRegisterOptions;
			type: 'context_menu';
	  };
