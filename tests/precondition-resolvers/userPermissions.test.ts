import { PermissionFlagsBits } from 'discord.js';
import { parseConstructorPreConditionsRequiredUserPermissions } from '../../src/lib/precondition-resolvers/userPermissions';
import { CommandPreConditions } from '../../src/lib/types/Enums';
import { PreconditionContainerArray } from '../../src/lib/utils/preconditions/PreconditionContainerArray';
import type { PreconditionContainerSingle } from '../../src/lib/utils/preconditions/PreconditionContainerSingle';
import type { PermissionPreconditionContext } from '../../src/preconditions/ClientPermissions';

describe('parseConstructorPreConditionsRequiredUserPermissions', () => {
	test('GIVEN valid permissions THEN appends to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsRequiredUserPermissions(PermissionFlagsBits.Administrator, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).name).toBe(CommandPreConditions.UserPermissions);
		expect(
			((preconditionContainerArray.entries[0] as PreconditionContainerSingle).context as PermissionPreconditionContext).permissions?.has(
				PermissionFlagsBits.Administrator
			)
		).toBe(true);
	});

	test('GIVEN no permissions THEN does not append to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsRequiredUserPermissions(undefined, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(0);
	});
});
