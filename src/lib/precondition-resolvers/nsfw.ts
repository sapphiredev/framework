import { CommandPreConditions, type PreconditionContainerArray } from '@sapphire/framework';

/**
 * Appends the `NSFW` precondition if {@link SubcommandMappingMethod.nsfw} is set to true.
 * @param nsfw Whether this command is NSFW or not.
 * @param preconditionContainerArray The precondition container array to append the precondition to.
 */
export function parseConstructorPreConditionsNsfw(nsfw: boolean | undefined, preconditionContainerArray: PreconditionContainerArray) {
	if (nsfw) preconditionContainerArray.append(CommandPreConditions.NotSafeForWork);
}
