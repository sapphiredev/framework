import type { UnorderedStrategy } from 'lexure';

const fullFlagIndicators = ['—', '--'];
const singleFlagIndicators = ['—', '-'];
export const flagUnorderedStrategy: UnorderedStrategy = {
	/* Note for future explorers
	   FLAGS: booleans (example: --yes, -y), WIHTOUT an equal sign(=)
	   OPTIONS: **double**-dashed flags with options (example: --idiot=enkiel), but only return the NAME
	   COMPACT OPTIONS: Options with their values
	*/
	matchFlag(s: string): string | null {
		const fullFlag = fullFlagIndicators.includes(s.substr(0, 2));
		return (fullFlag || (singleFlagIndicators.includes(s.substr(0, 1)) && s.length === 2)) && !s.includes('=')
			? s.substr(fullFlag ? 2 : 1).toLowerCase()
			: null;
	},

	matchOption(s: string): string | null {
		return fullFlagIndicators.includes(s.substr(0, 2)) && !s.includes('=') ? s.slice(1, -1).toLowerCase() : null;
	},

	matchCompactOption(s: string): [string, string] | null {
		const index = s.indexOf('=');
		if (!fullFlagIndicators.includes(s.substr(0, 2)) || index < 0) return null;

		return [s.slice(2, index).toLowerCase(), s.slice(index + 1)];
	}
};
