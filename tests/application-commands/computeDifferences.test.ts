import { ApplicationCommandOptionType, ApplicationCommandType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { getCommandDifferences } from '../../src/lib/utils/application-commands/computeDifferences';

describe('Compute differences for provided application commands', () => {
	it('given two identical context menu commands, it should not return any difference', () => {
		expect(
			getCommandDifferences(
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				},
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				}
			)
		).toEqual([]);
	});

	it('given one context menu command with one name and one context menu command with a different name, it should return the difference', () => {
		expect(
			getCommandDifferences(
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				},
				{
					type: ApplicationCommandType.Message,
					name: 'beep'
				}
			)
		).toEqual([
			{
				key: 'name',
				original: 'boop',
				expected: 'beep'
			}
		]);
	});

	it('given a context menu command with a default_permission set to true and one set to false, it should return the difference', () => {
		expect(
			getCommandDifferences(
				{
					type: ApplicationCommandType.Message,
					name: 'boop',
					default_permission: true
				},
				{
					type: ApplicationCommandType.Message,
					name: 'boop',
					default_permission: false
				}
			)
		).toEqual([
			{
				key: 'defaultPermission',
				original: 'true',
				expected: 'false'
			}
		]);
	});

	it('given two identical commands, it should not return any difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([]);
	});

	it('given 2 different descriptions, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 2',
			name: 'command2'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'description',
				original: command1.description,
				expected: command2.description
			}
		]);
	});

	it('given a command with a default_permission set to true and one set to false, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			default_permission: true
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			default_permission: false
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'defaultPermission',
				original: String(command1.default_permission),
				expected: String(command2.default_permission)
			}
		]);
	});

	it('given a command with no options and one with options, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options',
				original: 'no options present',
				expected: 'options present'
			}
		]);
	});

	it('given a command with options and one without options, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2'
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options',
				original: 'options present',
				expected: 'no options present'
			}
		]);
	});

	it('given a command with 1 option and one with 2 options, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option2'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[1]',
				original: 'no option present',
				expected: 'boolean option with name option2'
			}
		]);
	});

	it('given a command with 1 string option and one with 1 boolean option, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].type',
				original: 'string option',
				expected: 'boolean option'
			}
		]);
	});

	it('given a command with 1 string option and one with 1 string option named differently, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option2'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].name',
				original: 'option1',
				expected: 'option2'
			}
		]);
	});

	it('given a command with 1 string option and one with 1 string option with different descriptions, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 2',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].description',
				original: 'description 1',
				expected: 'description 2'
			}
		]);
	});

	it('given a command with a required option and one with an option that is not required, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					required: true
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].required',
				original: 'true',
				expected: 'false'
			}
		]);
	});

	it('given a command with 2 options and one with 1 option, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				},
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option2'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'existing command option at index 1',
				expected: 'no option present',
				original: 'string option with name option2'
			}
		]);
	});

	it('given a command with 1 sub command group that has 1 sub command and one with 1 sub command group that has 2 sub commands, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand
						},
						{
							name: 'subcommand2',
							description: 'description 2',
							type: ApplicationCommandOptionType.Subcommand
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].options[1]',
				original: 'no option present',
				expected: 'subcommand with name subcommand2'
			}
		]);
	});

	it('given a command with 1 sub command with no options and one command with 1 sub command with 1 option, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].options[0].options',
				original: 'no options present',
				expected: 'options present'
			}
		]);
	});

	it('given a command with 1 sub command with 1 option and one command with 1 sub command with no options, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].options[0].options',
				expected: 'no options present',
				original: 'options present'
			}
		]);
	});

	it('given a command with 1 sub command with 2 options and one command with 1 sub command with 1 option, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option1'
								},
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option2'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'existing command option at path options[0].options[0].options[1]',
				expected: 'no option present',
				original: 'string option with name option2'
			}
		]);
	});

	it('given a command with 1 sub command with 1 string option and one command with 1 sub command with 1 boolean option, it should return the difference', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.String,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		const command2 = {
			description: 'description 1',
			name: 'command2',
			options: [
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					description: 'description 1',
					name: 'option1',
					required: true,
					options: [
						{
							name: 'subcommand1',
							description: 'description 1',
							type: ApplicationCommandOptionType.Subcommand,
							options: [
								{
									type: ApplicationCommandOptionType.Boolean,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		} as RESTPostAPIChatInputApplicationCommandsJSONBody;

		expect(getCommandDifferences(command1, command2)).toEqual([
			{
				key: 'options[0].options[0].options[0].type',
				expected: 'boolean option',
				original: 'string option'
			}
		]);
	});
});
