import { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { isFunction } from '@sapphire/utilities';
import {
	ApplicationCommandType,
	APIApplicationCommandOption,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9';
import {
	ApplicationCommand,
	ChatInputApplicationCommandData,
	Constants,
	MessageApplicationCommandData,
	UserApplicationCommandData
} from 'discord.js';

export function normalizeChatInputCommand(
	command: ChatInputApplicationCommandData | SlashCommandBuilder | ((builder: SlashCommandBuilder) => SlashCommandBuilder)
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	if (isFunction(command)) {
		const builder = new SlashCommandBuilder();
		command(builder);
		return builder.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
	}

	if (command instanceof SlashCommandBuilder) {
		return command.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
	}

	const finalObject = {
		description: command.description,
		name: command.name,
		default_permission: command.defaultPermission,
		type: ApplicationCommandType.ChatInput
	} as RESTPostAPIChatInputApplicationCommandsJSONBody;

	if (command.options?.length) {
		finalObject.options = command.options.map((option) => ApplicationCommand['transformOption'](option) as APIApplicationCommandOption);
	}

	return finalObject;
}

export function normalizeContextMenuCommand(
	command:
		| UserApplicationCommandData
		| MessageApplicationCommandData
		| ContextMenuCommandBuilder
		| ((builder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder)
): RESTPostAPIContextMenuApplicationCommandsJSONBody {
	if (isFunction(command)) {
		const builder = new ContextMenuCommandBuilder();
		command(builder);
		return builder.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody;
	}

	if (command instanceof ContextMenuCommandBuilder) {
		return command.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody;
	}

	let type: ApplicationCommandType;

	switch (command.type) {
		case Constants.ApplicationCommandTypes.MESSAGE:
		case 'MESSAGE':
			type = ApplicationCommandType.Message;
			break;
		case Constants.ApplicationCommandTypes.USER:
		case 'USER':
			type = ApplicationCommandType.User;
			break;
		default:
			// @ts-expect-error command gets turned to never, which is half true.
			throw new Error(`Unhandled command type: ${command.type}`);
	}

	const finalObject = {
		name: command.name,
		type,
		default_permission: command.defaultPermission
	} as RESTPostAPIContextMenuApplicationCommandsJSONBody;

	return finalObject;
}

export function convertApplicationCommandToApiData(command: ApplicationCommand): RESTPostAPIChatInputApplicationCommandsJSONBody {
	const returnData = {
		name: command.name,
		description: command.description,
		default_permission: command.defaultPermission,
		type: ApplicationCommandType.ChatInput
	} as RESTPostAPIChatInputApplicationCommandsJSONBody;

	if (command.options.length) {
		returnData.options = command.options.map((option) => ApplicationCommand['transformOption'](option) as APIApplicationCommandOption);
	}

	return returnData;
}
