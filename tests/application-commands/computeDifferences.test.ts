import { ApplicationCommandOptionType, ApplicationCommandType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { getCommandDifferences } from '../../src/lib/utils/application-commands/computeDifferences';

describe('Compute differences for provided application commands', () => {
	test('GIVEN two identical context menu commands THEN do not return any difference', () => {
		expect(
			getCommandDifferences(
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				},
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				},
				false
			)
		).toEqual([]);
	});

	test('GIVEN one context menu command WHEN one name and one context menu command with a different name THEN return the difference', () => {
		expect(
			getCommandDifferences(
				{
					type: ApplicationCommandType.Message,
					name: 'boop'
				},
				{
					type: ApplicationCommandType.Message,
					name: 'beep'
				},
				false
			)
		).toEqual([
			{
				key: 'name',
				original: 'boop',
				expected: 'beep'
			}
		]);
	});

	test('GIVEN a context menu command WHEN a "default_permission" set to true and one set to false THEN return the difference', () => {
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
				},
				false
			)
		).toEqual([
			{
				key: 'defaultPermission',
				original: 'true',
				expected: 'false'
			}
		]);
	});

	test('GIVEN two identical commands THEN do not return any difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([]);
	});

	test('GIVEN 2 different descriptions THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 2',
			name: 'command1'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'description',
				original: command1.description,
				expected: command2.description
			}
		]);
	});

	test('GIVEN a command WHEN a default_permission set to true and one set to false THEN should return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_permission: true
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_permission: false
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'defaultPermission',
				original: String(command1.default_permission),
				expected: String(command2.default_permission)
			}
		]);
	});

	test('GIVEN a command WHEN "dm_permission" set to undefined and one set to false THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			dm_permission: undefined
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			dm_permission: false
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'dmPermission',
				original: String(true),
				expected: String(command2.dm_permission)
			}
		]);
	});

	test('GIVEN a command WHEN default_member_permissions set to undefined and one set to "0" THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_member_permissions: undefined
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_member_permissions: '0'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'defaultMemberPermissions',
				original: String(command1.default_member_permissions),
				expected: String(command2.default_member_permissions)
			}
		]);
	});

	test('GIVEN a command WHEN default_member_permissions set to "0" and one set to null THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_member_permissions: '0'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			default_member_permissions: null
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'defaultMemberPermissions',
				original: String(command1.default_member_permissions),
				expected: String(command2.default_member_permissions)
			}
		]);
	});

	test('GIVEN a command WHEN no options and one with options THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options',
				original: 'no options present',
				expected: 'options present'
			}
		]);
	});

	test('GIVEN a command WHEN options and one without options THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options',
				original: 'options present',
				expected: 'no options present'
			}
		]);
	});

	test('GIVEN a command WHEN 1 option and one with 2 options THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
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
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[1]',
				original: 'no option present',
				expected: 'boolean option with name option2'
			}
		]);
	});

	test('GIVEN a command WHEN 1 string option and one with 1 boolean option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].type',
				original: 'string option',
				expected: 'boolean option'
			}
		]);
	});

	test('GIVEN a command WHEN 1 string option and one with 1 string option named differently THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option2'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].name',
				original: 'option1',
				expected: 'option2'
			}
		]);
	});

	test('GIVEN a command WHEN 1 string option and one with 1 string option with different descriptions THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 2',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].description',
				original: 'description 1',
				expected: 'description 2'
			}
		]);
	});

	test('GIVEN a command WHEN a required option and one with an option that is not required THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].required',
				original: 'true',
				expected: 'false'
			}
		]);
	});

	test('GIVEN a command WHEN 2 options and one with 1 option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'existing command option at index 1',
				expected: 'no option present',
				original: 'string option with name option2'
			}
		]);
	});

	test('GIVEN a command WHEN 1 sub command group that has 1 sub command and one with 1 sub command group that has 2 sub commands THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
						},
						{
							name: 'subcommand2',
							description: 'description 2',
							type: ApplicationCommandOptionType.Subcommand
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].options[1]',
				original: 'no option present',
				expected: 'subcommand with name subcommand2'
			}
		]);
	});

	test('GIVEN a command WHEN 1 sub command with no options and one command with 1 sub command with 1 option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].options[0].options',
				original: 'no options present',
				expected: 'options present'
			}
		]);
	});

	test('GIVEN a command WHEN 1 sub command with 1 option and one command with 1 sub command with no options THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].options[0].options',
				expected: 'no options present',
				original: 'options present'
			}
		]);
	});

	test('GIVEN a command WHEN 1 sub command with 2 options and one command with 1 sub command with 1 option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'existing command option at path options[0].options[0].options[1]',
				expected: 'no option present',
				original: 'string option with name option2'
			}
		]);
	});

	test('GIVEN a command WHEN 1 sub command with 1 string option and one command with 1 sub command with 1 boolean option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
									type: ApplicationCommandOptionType.Boolean,
									description: 'description 1',
									name: 'option1'
								}
							]
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].options[0].options[0].type',
				expected: 'boolean option',
				original: 'string option'
			}
		]);
	});

	test('GIVEN a command WHEN no options and one with an empty options array THEN do not throw an error', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: []
		};

		expect(() => getCommandDifferences(command1, command2, false)).not.toThrow();
		expect(() => getCommandDifferences(command2, command1, false)).not.toThrow();
	});

	test('GIVEN two commands WHEN different names THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command2'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'name',
				expected: 'command2',
				original: 'command1'
			}
		]);
	});

	test('GIVEN a command WHEN a number option and a command with a number option expecting a minimum value of 69 THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					min_value: 69
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].min_value',
				expected: 'min_value present',
				original: 'no min_value present'
			}
		]);
	});

	test('GIVEN a command WHEN a number option expecting a minimum value of 69 and a command with a number option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					min_value: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].min_value',
				expected: 'no min_value present',
				original: 'min_value present'
			}
		]);
	});

	test('GIVEN a command WHEN a number option expecting a minimum value of 69 and a command with a number option expecting a minimum value of 420 THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					min_value: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					min_value: 420
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].min_value',
				expected: '420',
				original: '69'
			}
		]);
	});

	//

	test('GIVEN a command WHEN a number option and a command with a number option expecting a maximum value of 69 THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					max_value: 69
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].max_value',
				expected: 'max_value present',
				original: 'no max_value present'
			}
		]);
	});

	test('GIVEN a command WHEN a number option expecting a maximum value of 69 and a command with a number option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					max_value: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].max_value',
				expected: 'no max_value present',
				original: 'max_value present'
			}
		]);
	});

	test('GIVEN a command WHEN a number option expecting a maximum value of 69 and a command with a number option expecting a maximum value of 420 THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					max_value: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					max_value: 420
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].max_value',
				expected: '420',
				original: '69'
			}
		]);
	});

	test('GIVEN a command WHEN a string option and a command with a string option that can be autocompleted THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					autocomplete: true
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].autocomplete',
				expected: 'autocomplete enabled',
				original: 'autocomplete disabled'
			}
		]);
	});

	test('GIVEN a command WHEN a string option that can be autocompleted and a command with a string option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					autocomplete: true
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].autocomplete',
				expected: 'autocomplete disabled',
				original: 'autocomplete enabled'
			}
		]);
	});

	test('GIVEN a command WHEN a string option and a command with a string option with a choice THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].choices',
				expected: 'choices present',
				original: 'no choices present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option with a choice and a command with a string option THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].choices',
				expected: 'no choices present',
				original: 'choices present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option with a choice and a command with a string option with two choices THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						},
						{
							name: 'choice2',
							value: 'value2'
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].choices[1]',
				original: 'no choice present',
				expected: 'choice present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option with a choice and a command with a string option with a choice with a different name THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice2',
							value: 'value1'
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].choices[0].name',
				expected: 'choice2',
				original: 'choice1'
			}
		]);
	});

	test('GIVEN a command WHEN a string option with a choice and a command with a string option with a choice with a different value THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value2'
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].choices[0].value',
				expected: 'value2',
				original: 'value1'
			}
		]);
	});

	test('GIVEN a command WHEN a string option with three choices and a command with a string option with one choice THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						},
						{
							name: 'choice2',
							value: 'value2'
						},
						{
							name: 'choice3',
							value: 'value3'
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 'value1'
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'existing choice at path options[0].choices[1]',
				expected: 'no choice present',
				original: 'choice with name "choice2" and value "value2" present'
			},
			{
				key: 'existing choice at path options[0].choices[2]',
				expected: 'no choice present',
				original: 'choice with name "choice3" and value "value3" present'
			}
		]);
	});

	test('GIVEN a command WHEN a number option with two choices and a command with a number option with one choice THEN return the differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 1
						},
						{
							name: 'choice2',
							value: 2
						}
					]
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					description: 'description 1',
					name: 'option1',
					choices: [
						{
							name: 'choice1',
							value: 1
						}
					]
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'existing choice at path options[0].choices[1]',
				expected: 'no choice present',
				original: 'choice with name "choice2" and value 2 present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option has no minimum length and a command with a string option has a minimum length THEN return the differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					min_length: 1
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].min_length',
				expected: 'min_length present',
				original: 'no min_length present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option has a minimum length of 69 and a command with a string option has a minimum length of 420 THEN return the differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					min_length: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					min_length: 420
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].min_length',
				expected: '420',
				original: '69'
			}
		]);
	});

	test('GIVEN a command WHEN a string option has no maximum length and a command with a string option has a maximum length THEN return the differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1'
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					max_length: 1
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].max_length',
				expected: 'max_length present',
				original: 'no max_length present'
			}
		]);
	});

	test('GIVEN a command WHEN a string option has a maximum length of 69 and a command with a string option has a maximum length of 420 THEN return the differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					max_length: 69
				}
			]
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					description: 'description 1',
					name: 'option1',
					max_length: 420
				}
			]
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'options[0].max_length',
				expected: '420',
				original: '69'
			}
		]);
	});

	// Localizations
	test('GIVEN a command WHEN no name localizations and a command with name localizations THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			name: 'command1',
			description: 'description 1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda1'
			}
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'nameLocalizations',
				expected: 'localized names',
				original: 'no localized names'
			}
		]);
	});

	test('GIVEN a command WHEN name localizations and a command with no name localizations THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda1'
			}
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'nameLocalizations',
				expected: 'no localized names',
				original: 'localized names'
			}
		]);
	});

	test('GIVEN a command WHEN name localizations and a command with different name localizations THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda1'
			}
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				'es-ES': 'dominio1'
			}
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'nameLocalizations.es-ES',
				original: 'no localization present',
				expected: 'dominio1'
			},
			{
				key: 'nameLocalizations.ro',
				expected: 'no localization present',
				original: 'comanda1'
			}
		]);
	});

	test('GIVEN a command WHEN name localizations and a command with empty name localizations THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda1'
			}
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {}
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'nameLocalizations.ro',
				expected: 'no localization present',
				original: 'comanda1'
			}
		]);
	});

	test('GIVEN a command WHEN name localizations and a command with different name localizations for the same locale THEN return the difference', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda1'
			}
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			name_localizations: {
				ro: 'comanda2'
			}
		};

		expect(getCommandDifferences(command1, command2, false)).toEqual([
			{
				key: 'nameLocalizations.ro',
				expected: 'comanda2',
				original: 'comanda1'
			}
		]);
	});

	// Guild commands shenanigans
	test('GIVEN a guild command WHEN dm_permission is set to false in the builder THEN returns no differences', () => {
		const command1: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1'
		};

		const command2: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			description: 'description 1',
			name: 'command1',
			dm_permission: false
		};

		expect(getCommandDifferences(command1, command2, true)).toEqual([]);
	});
});
