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
} from 'discord-api-types/v9';
import {
	PermissionsBitField,
	ApplicationCommand,
	ChatInputApplicationCommandData,
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
		return builder.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
	}

	if (isBuilder(command)) {
		return command.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
	}

	const finalObject: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		description: command.description,
		description_localizations: command.descriptionLocalizations,
		default_member_permissions: new PermissionsBitField(command.defaultMemberPermissions!).bitfield.toString(),
		dm_permission: command.dmPermission,
		type: ApplicationCommandType.ChatInput
	};

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
		| ((builder: ContextMenuCommandBuilder) => unknown)
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
		case ApplicationCommandType.Message:
			type = ApplicationCommandType.Message;
			break;
		case ApplicationCommandType.User:
			type = ApplicationCommandType.User;
			break;
		default:
			throw new Error(`Unhandled command type: ${command.type}`);
	}

	const finalObject: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		type,
		default_member_permissions: new PermissionsBitField(command.defaultMemberPermissions!).bitfield.toString(),
		dm_permission: command.dmPermission
	};

	return finalObject;
}

export function convertApplicationCommandToApiData(command: ApplicationCommand): RESTPostAPIApplicationCommandsJSONBody {
	const returnData = {
		name: command.name,
		name_localizations: command.nameLocalizations,
		default_member_permission: command.defaultMemberPermissions,
		type: command.type
	} as RESTPostAPIApplicationCommandsJSONBody;

	if (command.type === ApplicationCommandType.ChatInput) {
		returnData.type = ApplicationCommandType.ChatInput;
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description = command.description;
		// TODO (favna): Remove this line after website rewrite is done
		// @ts-ignore this is currently ignored for the website
		(returnData as RESTPostAPIChatInputApplicationCommandsJSONBody).description_localizations = command.descriptionLocalizations;
	}

	if (command.options.length) {
		returnData.options = command.options.map((option) => ApplicationCommand['transformOption'](option as any) as APIApplicationCommandOption);
	}

	return returnData;
}
