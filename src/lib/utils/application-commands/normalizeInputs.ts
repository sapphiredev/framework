import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import { isFunction } from '@sapphire/utilities';
import {
	APIApplicationCommandOption,
	ApplicationCommandType,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v10';
import {
	ApplicationCommand,
	ChatInputApplicationCommandData,
	Constants,
	MessageApplicationCommandData,
	UserApplicationCommandData
} from 'discord.js';

function isBuilder(
	command: unknown
): command is
	| SlashCommandBuilder
	| SlashCommandSubcommandsOnlyBuilder
	| SlashCommandOptionsOnlyBuilder
	| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> {
	return command instanceof SlashCommandBuilder;
}

function addDefaultsToChatInputJSON(data: RESTPostAPIChatInputApplicationCommandsJSONBody): RESTPostAPIChatInputApplicationCommandsJSONBody {
	data.default_permission ??= true;
	data.dm_permission ??= true;
	data.type ??= ApplicationCommandType.ChatInput;

	// Localizations default to null from d.js
	data.name_localizations ??= null;
	data.description_localizations ??= null;

	return data;
}

function addDefaultsToContextMenuJSON(data: RESTPostAPIContextMenuApplicationCommandsJSONBody): RESTPostAPIContextMenuApplicationCommandsJSONBody {
	data.default_permission ??= true;
	data.dm_permission ??= true;

	// Localizations default to null from d.js
	data.name_localizations ??= null;
	data.description_localizations ??= null;

	return data;
}

export function normalizeChatInputCommand(
	command:
		| ChatInputApplicationCommandData
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| ((builder: SlashCommandBuilder) => unknown)
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	if (isFunction(command)) {
		const builder = new SlashCommandBuilder();
		command(builder);
		return addDefaultsToChatInputJSON(builder.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody);
	}

	if (isBuilder(command)) {
		return addDefaultsToChatInputJSON(command.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody);
	}

	const finalObject: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		description: command.description,
		description_localizations: command.descriptionLocalizations,
		default_permission: command.defaultPermission,
		type: ApplicationCommandType.ChatInput,
		dm_permission: command.dmPermission
	};

	if (command.defaultMemberPermissions) {
		finalObject.default_member_permissions = String(command.defaultMemberPermissions);
	}

	if (command.options?.length) {
		finalObject.options = command.options.map((option) => ApplicationCommand['transformOption'](option) as APIApplicationCommandOption);
	}

	return addDefaultsToChatInputJSON(finalObject);
}

export function normalizeContextMenuCommand(
	command:
		| UserApplicationCommandData
		| MessageApplicationCommandData
		| ContextMenuCommandBuilder
		| ((builder: ContextMenuCommandBuilder) => unknown)
): RESTPostAPIContextMenuApplicationCommandsJSONBody {
	if (isFunction(command)) {
		const builder = new ContextMenuCommandBuilder();
		command(builder);
		return addDefaultsToContextMenuJSON(builder.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody);
	}

	if (command instanceof ContextMenuCommandBuilder) {
		return addDefaultsToContextMenuJSON(command.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody);
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

	const finalObject: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		type,
		default_permission: command.defaultPermission,
		dm_permission: command.dmPermission
	};

	if (command.defaultMemberPermissions) {
		finalObject.default_member_permissions = String(command.defaultMemberPermissions);
	}

	return addDefaultsToContextMenuJSON(finalObject);
}

export function convertApplicationCommandToApiData(command: ApplicationCommand): RESTPostAPIApplicationCommandsJSONBody {
	const returnData = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		default_permission: command.defaultPermission,
		dm_permission: command.dmPermission
	} as RESTPostAPIApplicationCommandsJSONBody;

	if (command.defaultMemberPermissions) {
		returnData.default_member_permissions = command.defaultMemberPermissions.bitfield.toString();
	}

	if (command.type === 'CHAT_INPUT') {
		returnData.type = ApplicationCommandType.ChatInput;
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description = command.description;
		// TODO (favna): Remove this line after website rewrite is done
		// @ts-ignore this is currently ignored for the website
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description_localizations = command.descriptionLocalizations;
	} else if (command.type === 'MESSAGE') {
		returnData.type = ApplicationCommandType.Message;
	} else if (command.type === 'USER') {
		returnData.type = ApplicationCommandType.User;
	}

	if (command.options.length) {
		returnData.options = command.options.map((option) => ApplicationCommand['transformOption'](option as any) as APIApplicationCommandOption);
	}

	return returnData;
}
