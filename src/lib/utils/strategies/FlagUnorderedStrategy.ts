import type { UnorderedStrategy } from 'lexure';

export class FlagStrategy implements UnorderedStrategy {
	public readonly flags: ReadonlySet<string>;
	public readonly flagPrefixes;
	private readonly letterRegex = /[a-zA-Z0-9=]{1,}/g;

	public constructor(flags: readonly string[], flagPrefixes = ['--', '-', '—']) {
		this.flags = new Set(flags);
		this.flagPrefixes = flagPrefixes;
	}

	public matchFlag(s: string): string | null {
		const flagName = this.getFlagName(s);
		const result = this.startsWithArrayString(this.flagPrefixes, s);
		return result && !s.includes('=') && flagName && this.flags.has(flagName) ? this.getFlagName(s) : null;
	}

	public matchOption(s: string): string | null {
		const flagName = this.getFlagName(s);
		return this.startsWithArrayString(this.flagPrefixes, s) && s.includes('=') && flagName && this.flags.has(flagName)
			? this.getFlagName(s)
			: null;
	}

	public matchCompactOption(s: string): [string, string] | null {
		const index = s.indexOf('=');
		if (!this.startsWithArrayString(this.flagPrefixes, s) || index < 0) return null;

		const flagName = this.getFlagName(s.substr(0, index));
		if (!flagName || !this.flags.has(flagName)) return null;

		const value = s.substr(index + 1);
		return [flagName, value];
	}

	private startsWithArrayString(arr: string[], s: string) {
		for (const i of arr) {
			if (s.startsWith(i)) return true;
		}
		return false;
	}

	private getFlagName(s: string) {
		const clone = s;
		const res = this.letterRegex.exec(clone);
		return res === null ? null : res[0].toLowerCase();
	}
}
