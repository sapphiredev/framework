import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type APIApplicationCommandChannelOption,
	type APIApplicationCommandIntegerOption,
	type APIApplicationCommandNumberOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandStringOption,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption
} from 'discord-api-types/v10';

export const optionTypeToPrettyName = new Map<ApplicationCommandOptionType, string>([
	[ApplicationCommandOptionType.Subcommand, 'subcommand'],
	[ApplicationCommandOptionType.SubcommandGroup, 'subcommand group'],
	[ApplicationCommandOptionType.String, 'string option'],
	[ApplicationCommandOptionType.Integer, 'integer option'],
	[ApplicationCommandOptionType.Boolean, 'boolean option'],
	[ApplicationCommandOptionType.User, 'user option'],
	[ApplicationCommandOptionType.Channel, 'channel option'],
	[ApplicationCommandOptionType.Role, 'role option'],
	[ApplicationCommandOptionType.Mentionable, 'mentionable option'],
	[ApplicationCommandOptionType.Number, 'number option'],
	[ApplicationCommandOptionType.Attachment, 'attachment option']
]);

export const contextMenuTypes = [ApplicationCommandType.Message, ApplicationCommandType.User];
export const subcommandTypes = [ApplicationCommandOptionType.SubcommandGroup, ApplicationCommandOptionType.Subcommand];

export type APIApplicationCommandSubcommandTypes = APIApplicationCommandSubcommandOption | APIApplicationCommandSubcommandGroupOption;
export type APIApplicationCommandMinAndMaxValueTypes = APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption;
export type APIApplicationCommandChoosableAndAutocompletableTypes = APIApplicationCommandMinAndMaxValueTypes | APIApplicationCommandStringOption;
export type APIApplicationCommandMinMaxLengthTypes = APIApplicationCommandStringOption;

export function hasMinMaxValueSupport(option: APIApplicationCommandOption): option is APIApplicationCommandMinAndMaxValueTypes {
	return [ApplicationCommandOptionType.Integer, ApplicationCommandOptionType.Number].includes(option.type);
}

export function hasChoicesAndAutocompleteSupport(
	option: APIApplicationCommandOption
): option is APIApplicationCommandChoosableAndAutocompletableTypes {
	return [
		ApplicationCommandOptionType.Integer, //
		ApplicationCommandOptionType.Number,
		ApplicationCommandOptionType.String
	].includes(option.type);
}

export function hasMinMaxLengthSupport(option: APIApplicationCommandOption): option is APIApplicationCommandMinMaxLengthTypes {
	return option.type === ApplicationCommandOptionType.String;
}

export function hasChannelTypesSupport(option: APIApplicationCommandOption): option is APIApplicationCommandChannelOption {
	return option.type === ApplicationCommandOptionType.Channel;
}

export interface CommandDifference {
	key: string;
	expected: string;
	original: string;
}
