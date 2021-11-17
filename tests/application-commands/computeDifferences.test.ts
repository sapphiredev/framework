import { getCommandDifferences } from '../../src/lib/utils/application-commands/computeDifferences';

describe('Compute differences for provided application commands', () => {
	it('should not return any differences for two identical commands', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1'
		};

		const command2 = {
			description: 'description 1',
			name: 'command2'
		};

		expect(getCommandDifferences(command1, command2)).toEqual([]);
	});

	it('should return the different description', () => {
		const command1 = {
			description: 'description 1',
			name: 'command1'
		};

		const command2 = {
			description: 'description 2',
			name: 'command2'
		};

		expect(getCommandDifferences(command1, command2)).toEqual([]);
	});
});
