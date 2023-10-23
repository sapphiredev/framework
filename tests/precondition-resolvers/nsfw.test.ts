import { parseConstructorPreConditionsNsfw } from '../../src/lib/precondition-resolvers/nsfw';
import { CommandPreConditions } from '../../src/lib/types/Enums';
import { PreconditionContainerArray } from '../../src/lib/utils/preconditions/PreconditionContainerArray';

describe('parseConstructorPreConditionsNsfw', () => {
	test('GIVEN nsfw true THEN appends to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsNsfw(true, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as any).name).toBe(CommandPreConditions.NotSafeForWork);
	});

	test('GIVEN nsfw false THEN does not append to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsNsfw(false, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(0);
	});

	test('GIVEN nsfw undefined THEN does not append to preconditionContainerArray', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsNsfw(undefined, preconditionContainerArray);
		expect(preconditionContainerArray.entries.length).toBe(0);
	});
});
