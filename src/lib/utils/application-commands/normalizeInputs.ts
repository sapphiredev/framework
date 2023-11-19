import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import { isFunction } from '@sapphire/utilities';
import {
	ApplicationCommandType,
	type APIApplicationCommandOption,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v10';
import {
	ApplicationCommand,
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type MessageApplicationCommandData,
	type UserApplicationCommandData
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
	data.dm_permission ??= true;
	data.type ??= ApplicationCommandType.ChatInput;

	return data;
}

function addDefaultsToContextMenuJSON(data: RESTPostAPIContextMenuApplicationCommandsJSONBody): RESTPostAPIContextMenuApplicationCommandsJSONBody {
	data.dm_permission ??= true;

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
		type: ApplicationCommandType.ChatInput,
		dm_permission: command.dmPermission,
		nsfw: command.nsfw
	};

	if (typeof command.defaultMemberPermissions !== 'undefined') {
		finalObject.default_member_permissions =
			command.defaultMemberPermissions === null ? null : new PermissionsBitField(command.defaultMemberPermissions).bitfield.toString();
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

	const finalObject: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		type: command.type,
		dm_permission: command.dmPermission,
		nsfw: command.nsfw
	};

	if (typeof command.defaultMemberPermissions !== 'undefined') {
		finalObject.default_member_permissions =
			command.defaultMemberPermissions === null ? null : new PermissionsBitField(command.defaultMemberPermissions).bitfield.toString();
	}

	return addDefaultsToContextMenuJSON(finalObject);
}

export function convertApplicationCommandToApiData(command: ApplicationCommand): RESTPostAPIApplicationCommandsJSONBody {
	const returnData = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		dm_permission: command.dmPermission,
		nsfw: command.nsfw,
		default_member_permissions: command.defaultMemberPermissions?.bitfield.toString() ?? null
	} as RESTPostAPIApplicationCommandsJSONBody;

	if (command.type === ApplicationCommandType.ChatInput) {
		returnData.type = ApplicationCommandType.ChatInput;
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description = command.description;
		// TODO (favna): Remove this line after website rewrite is done
		// @ts-ignore this is currently ignored for the website
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description_localizations = command.descriptionLocalizations;
	} else if (command.type === ApplicationCommandType.Message) {
		returnData.type = ApplicationCommandType.Message;
	} else if (command.type === ApplicationCommandType.User) {
		returnData.type = ApplicationCommandType.User;
	} else {
		throw new Error(`Unknown command type received: ${command.type}`);
	}

	if (command.options.length) {
		returnData.options = command.options.map((option) => ApplicationCommand['transformOption'](option as any) as APIApplicationCommandOption);
	}

	return returnData;
}
