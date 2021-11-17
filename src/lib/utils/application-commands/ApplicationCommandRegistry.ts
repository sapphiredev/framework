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
import { getCommandDifferences } from './computeDifferences';
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

		return this;
	}

	public addChatInputCommandNames(...names: string[] | string[][]) {
		const flattened = names.flat(Infinity) as string[];

		for (const command of flattened) {
			this.debug(`Registering name "${command}" to internal map`);
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
			this.debug(`Registering name "${command}" to internal map`);
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
				this.debug(`Registering id "${entry}" to internal map`);
			} catch {
				// Don't be silly, save yourself the headaches and do as we say
				this.debug(`Registering name "${entry}" to internal map`);
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
				this.debug(`Registering id "${entry}" to internal map`);
			} catch {
				this.debug(`Registering name "${entry}" to internal map`);
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

	protected async runAPICalls() {
		this.debug(`Preparing to process ${this.apiCalls.length} possible command registrations / updates...`);

		const { client } = container;

		const applicationCommands = client.application!.commands;
		const globalCommands = await applicationCommands.fetch();

		const unprocessedGuildIds = this.apiCalls.reduce<string[]>((acc, current) => {
			if (current.registerOptions.guildIds) acc.push(...current.registerOptions.guildIds);
			return acc;
		}, []);

		const uniqueGuildIds = new Set(unprocessedGuildIds);

		const guildCommands = await this.fetchGuildCommands(applicationCommands, uniqueGuildIds);

		await Promise.allSettled(this.apiCalls.map((call) => this.handleAPICall(applicationCommands, globalCommands, guildCommands, call)));
	}

	private async fetchGuildCommands(commands: ApplicationCommandManager, guildIds: ReadonlySet<string>) {
		const map = new Map<string, Collection<string, ApplicationCommand>>();

		for (const guildId of guildIds) {
			const guildCommands = await commands.fetch({ guildId });
			map.set(guildId, guildCommands);
		}

		return map;
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

			// Find the command by name
			return entry.name === commandName;
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
				apiCall.type === 'chat_input' ? this.addChatInputCommandIds(globalCommand.id) : this.addContextMenuCommandIds(globalCommand.id);

				this.debug(`Checking if command "${commandName}" is identical with global ${type} command with id "${globalCommand.id}"`);
				await this.handleCommandPresent(globalCommand, builtData, behaviorIfNotEqual);
			} else {
				this.debug(`Creating new global ${type} command with name "${commandName}"`);
				await this.createMissingCommand(commandsManager, builtData);
			}

			return;
		}

		for (const guildId of registerOptions.guildIds) {
			const guildCommands = allGuildsCommands.get(guildId);

			if (!guildCommands) {
				this.debug(`There are no commands for guild with id "${guildId}". Will create ${type} command "${commandName}".`);
				await this.createMissingCommand(commandsManager, builtData, guildId);
				continue;
			}

			const existingGuildCommand = guildCommands.find(findCallback);

			if (existingGuildCommand) {
				this.debug(`Checking if guild ${type} command "${commandName}" is identical to command "${existingGuildCommand.id}"`);
				apiCall.type === 'chat_input'
					? this.addChatInputCommandIds(existingGuildCommand.id)
					: this.addContextMenuCommandIds(existingGuildCommand.id);

				await this.handleCommandPresent(existingGuildCommand, builtData, behaviorIfNotEqual);
			} else {
				this.debug(`Creating new guild ${type} command with name "${commandName}" for guild "${guildId}"`);
				await this.createMissingCommand(commandsManager, builtData, guildId);
			}
		}
	}

	private async handleCommandPresent(
		applicationCommand: ApplicationCommand,
		apiData: InternalAPICall['builtData'],
		behaviorIfNotEqual: RegisterBehavior,
		guildId?: string
	) {
		// Step -1: If we outright don't care, we can just return
		if (behaviorIfNotEqual === RegisterBehavior.Ignore) {
			return;
		}

		// Step 0: compute differences
		const differences = getCommandDifferences(convertApplicationCommandToApiData(applicationCommand), apiData);

		// Step 1: if there are no differences, return
		if (!differences.length) {
			this.debug(
				`${guildId ? 'Guild command' : 'Command'} "${apiData.name}" is identical to command ${applicationCommand.name} (${
					applicationCommand.id
				})`
			);
			return;
		}

		// @ts-expect-error Need to compile just to test, shut up I will implement it later
		this.logCommandDifferences(differences, applicationCommand, apiData);

		// Step 2: if the behavior is to log to console, log the differences
		if (behaviorIfNotEqual === RegisterBehavior.LogToConsole) {
			return;
		}

		// Step 3: if the behavior is to update, update the command
		try {
			this.debug(`Updating command ${applicationCommand.name} (${applicationCommand.id})`);
			await applicationCommand.edit(apiData as ChatInputApplicationCommandData);
		} catch (error) {
			this.error(`Failed to update command ${applicationCommand.name} (${applicationCommand.id})`, error);
		}
	}

	private async createMissingCommand(commandsManager: ApplicationCommandManager, apiData: InternalAPICall['builtData'], guildId?: string) {
		try {
			// @ts-expect-error I messed up the overload, PR https://github.com/discordjs/discord.js/pull/6970 needs to be released
			const result = await commandsManager.create(apiData, guildId);

			apiData.type === ApplicationCommandType.ChatInput ? this.addChatInputCommandIds(result.id) : this.addContextMenuCommandIds(result.id);
		} catch (err) {
			this.error(`Failed to register application command with name "${apiData.name}"${guildId ? ` for guild "${guildId}"` : ''}`, err);
		}
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
