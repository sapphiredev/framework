import type { UnorderedStrategy } from 'lexure';

/**
 * The strategy options used in Sapphire.
 */
export interface FlagStrategyOptions {
	/**
	 * The accepted flags. Flags are key-value identifiers that can be placed anywhere in the command.
	 * @default []
	 */
	flags?: readonly string[];

	/**
	 * The accepted options. Options are key-only identifiers that can be placed anywhere in the command.
	 * @default []
	 */
	options?: readonly string[];

	/**
	 * The prefixes for both flags and options.
	 * @default ['--', '-', '—']
	 */
	prefixes?: string[];

	/**
	 * The flag separators.
	 * @default ['=', ':']
	 */
	separators?: string[];
}

export class FlagUnorderedStrategy implements UnorderedStrategy {
	public readonly flags: readonly string[];
	public readonly options: readonly string[];
	public readonly prefixes: readonly string[];
	public readonly separators: readonly string[];

	public constructor({ flags = [], options = [], prefixes = ['--', '-', '—'], separators = ['=', ':'] }: FlagStrategyOptions = {}) {
		this.flags = flags;
		this.options = options;
		this.prefixes = prefixes;
		this.separators = separators;
	}

	public matchFlag(s: string): string | null {
		const prefix = this.prefixes.find((p) => s.startsWith(p));
		if (!prefix) return null;

		s = s.slice(prefix.length);

		// Flags must not contain separators.
		if (this.separators.some((p) => s.includes(p))) return null;

		// The flag must be an allowed one.
		if (this.flags.includes(s)) return s;

		// If it did not match a flag, return null.
		return null;
	}

	public matchOption(s: string): string | null {
		const prefix = this.prefixes.find((p) => s.startsWith(p));
		if (!prefix) return null;

		s = s.slice(prefix.length);
		const separator = this.separators.find((p) => s.endsWith(p));
		if (!separator) return null;

		s = s.slice(0, -separator.length);
		if (this.options.includes(s)) return s;

		return null;
	}

	public matchCompactOption(s: string): [string, string] | null {
		const pre = this.prefixes.find((x) => s.startsWith(x));
		if (pre == null) {
			return null;
		}

		s = s.slice(pre.length);
		const sep = this.separators.find((x) => s.includes(x));
		if (sep == null) {
			return null;
		}

		const i = s.indexOf(sep);
		if (i + sep.length === s.length) {
			return null;
		}

		const k = s.slice(0, i);
		if (!this.options.includes(k)) return null;

		const v = s.slice(i + sep.length);
		return [k, v];
	}
}
