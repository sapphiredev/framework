import type { UnorderedStrategy } from 'lexure';

export class FlagStrategy implements UnorderedStrategy {
	public readonly flags: ReadonlySet<string>;
	public readonly optionHyphens = ['—', '--'];
	public readonly flagHyphens = ['—', '-'];
	private readonly kHyphenRegex = /(?:-|—){1,2}/;

	public constructor(flags: readonly string[]) {
		this.flags = new Set(flags);
	}

	public matchFlag(s: string): string | null {
		return (this.startsWithArrayString(this.optionHyphens, s) ||
			(this.startsWithArrayString(this.flagHyphens, s) && s.length === 2 && !s.includes('='))) &&
			this.flags.has(this.getFlagName(s))
			? this.getFlagName(s)
			: null;
	}

	public matchOption(s: string): string | null {
		return this.startsWithArrayString(this.optionHyphens, s) && s.includes('=') && this.flags.has(this.getFlagName(s))
			? this.getFlagName(s)
			: null;
	}

	public matchCompactOption(s: string): [string, string] | null {
		const index = s.indexOf('=');
		if (!this.startsWithArrayString(this.optionHyphens, s) || index < 0) return null;

		const flagName = this.getFlagName(s.substr(0, index));
		if (!this.flags.has(flagName)) return null;

		return [this.getFlagName(s.substr(0, index)), s.substr(index + 1)];
	}

	private startsWithArrayString(arr: string[], s: string) {
		for (const i of arr) {
			if (s.startsWith(i)) return true;
		}
		return false;
	}

	private getFlagName(s: string) {
		return s.replace(this.kHyphenRegex, '').toLowerCase();
	}
}
