import { PermissionFlagsBits } from 'discord.js';
import { parseConstructorPreConditionsRequiredClientPermissions } from '../../src/lib/precondition-resolvers/clientPermissions';
import { CommandPreConditions } from '../../src/lib/types/Enums';
import { PreconditionContainerArray } from '../../src/lib/utils/preconditions/PreconditionContainerArray';
import type { PreconditionContainerSingle } from '../../src/lib/utils/preconditions/PreconditionContainerSingle';
import type { PermissionPreconditionContext } from '../../src/preconditions/ClientPermissions';

describe('parseConstructorPreConditionsRequiredClientPermissions', () => {
	test('GIVEN valid permissions THEN appends to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsRequiredClientPermissions(PermissionFlagsBits.Administrator, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).name).toBe(CommandPreConditions.ClientPermissions);
		expect(
			((preconditionContainerArray.entries[0] as PreconditionContainerSingle).context as PermissionPreconditionContext).permissions?.has(
				PermissionFlagsBits.Administrator
			)
		).toBe(true);
	});

	test('GIVEN no permissions THEN does not append to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsRequiredClientPermissions(undefined, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(0);
	});
});
