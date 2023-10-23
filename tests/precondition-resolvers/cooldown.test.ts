import type { CooldownOptions } from '../../src/lib/SapphireClient';
import { parseConstructorPreConditionsCooldown } from '../../src/lib/precondition-resolvers/cooldown';
import { BucketScope } from '../../src/lib/types/Enums';
import { PreconditionContainerArray } from '../../src/lib/utils/preconditions/PreconditionContainerArray';
import type { PreconditionContainerSingle } from '../../src/lib/utils/preconditions/PreconditionContainerSingle';

describe('parseConstructorPreConditionsCooldown', () => {
	vi.mock('@sapphire/pieces', async () => {
		const mod = await vi.importActual<typeof import('@sapphire/pieces')>('@sapphire/pieces');
		const { BucketScope } = await import('../../src/lib/types/Enums');

		return {
			...mod,
			container: {
				client: {
					options: {
						defaultCooldown: {
							limit: 1,
							delay: 2,
							scope: BucketScope.User,
							filteredCommands: undefined,
							filteredUsers: undefined
						} as CooldownOptions
					}
				}
			}
		};
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	test('when limit and delay are undefined, sets limit to default limit and delay to default delay', () => {
		const preconditionContainerArray = new PreconditionContainerArray();

		parseConstructorPreConditionsCooldown({ name: 'test' } as any, undefined, undefined, undefined, undefined, preconditionContainerArray);

		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).name).toBe('Cooldown');
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).context).toMatchObject({
			scope: BucketScope.User,
			limit: 1,
			delay: 2,
			filteredUsers: undefined
		});
	});

	test('when limit and delay are defined, sets limit to passed limit and delay to passed delay', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsCooldown({ name: 'test' } as any, 5, 10, undefined, undefined, preconditionContainerArray);

		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).name).toBe('Cooldown');
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).context).toMatchObject({
			scope: BucketScope.User,
			limit: 5,
			delay: 10,
			filteredUsers: undefined
		});
	});

	test('when scope, filteredUsers, limit, and delay are defined, sets all values to passed values', () => {
		const preconditionContainerArray = new PreconditionContainerArray();
		parseConstructorPreConditionsCooldown({ name: 'test' } as any, 5, 10, BucketScope.Guild, ['user1', 'user2'], preconditionContainerArray);

		expect(preconditionContainerArray.entries.length).toBe(1);
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).name).toBe('Cooldown');
		expect((preconditionContainerArray.entries[0] as PreconditionContainerSingle).context).toMatchObject({
			scope: BucketScope.Guild,
			limit: 5,
			delay: 10,
			filteredUsers: ['user1', 'user2']
		});
	});
});
