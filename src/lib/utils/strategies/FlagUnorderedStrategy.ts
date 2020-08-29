import type { UnorderedStrategy } from 'lexure';

const optionHyphens = ['—', '--'];
const flagHyphens = ['—', '-'];

const startsWith = (arr: string[], str: string) => {
	for (const i of arr) {
		if (str.startsWith(i)) return true;
	}
	return false;
};
export const flagUnorderedStrategy: UnorderedStrategy = {
	/* Note for future explorers
	   FLAGS: booleans (example: --yes, -y), WIHTOUT an equal sign(=)
	   OPTIONS: **double**-dashed flags with options (example: --idiot=enkiel), but only return the NAME
	   COMPACT OPTIONS: Options with their values
	*/
	matchFlag(s: string): string | null {
		const fullFlag = startsWith(optionHyphens, s);
		return (fullFlag || (startsWith(flagHyphens, s) && s.length === 2)) && !s.includes('=') ? s.substr(fullFlag ? 2 : 1).toLowerCase() : null;
	},

	matchOption(s: string): string | null {
		return startsWith(optionHyphens, s) && !s.includes('=') ? s.slice(1, -1).toLowerCase() : null;
	},

	matchCompactOption(s: string): [string, string] | null {
		const index = s.indexOf('=');
		if (!startsWith(optionHyphens, s) || index < 0) return null;

		return [s.slice(2, index).toLowerCase(), s.slice(index + 1)];
	}
};
