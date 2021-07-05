import type { UnorderedStrategy } from 'lexure';

/**
 * The strategy options used in Sapphire.
 */
export interface FlagStrategyOptions {
	/**
	 * The accepted flags. Flags are key-only identifiers that can be placed anywhere in the command. Two different types are accepted:
	 * * An array of strings, e.g. [`silent`].
	 * * A boolean defining whether the strategy should accept all keys (`true`) or none at all (`false`).
	 * @default []
	 */
	flags?: readonly string[] | boolean;

	/**
	 * The accepted options. Options are key-value identifiers that can be placed anywhere in the command. Two different types are accepted:
	 * * An array of strings, e.g. [`silent`].
	 * * A boolean defining whether the strategy should accept all keys (`true`) or none at all (`false`).
	 * @default []
	 */
	options?: readonly string[] | boolean;

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

const never = () => null;
const always = () => true;

export class FlagUnorderedStrategy implements UnorderedStrategy {
	public readonly flags: readonly string[] | true;
	public readonly options: readonly string[] | true;
	public readonly prefixes: readonly string[];
	public readonly separators: readonly string[];

	public constructor({ flags, options, prefixes = ['--', '-', '—'], separators = ['=', ':'] }: FlagStrategyOptions = {}) {
		this.flags = flags || [];
		this.options = options || [];
		this.prefixes = prefixes;
		this.separators = separators;

		if (this.flags === true) this.allowedFlag = always;
		else if (this.flags.length === 0) this.matchFlag = never;

		if (this.options === true) {
			this.allowedOption = always;
		} else if (this.options.length === 0) {
			this.matchOption = never;
			this.matchCompactOption = never;
		}
	}

	public matchFlag(s: string): string | null {
		const prefix = this.prefixes.find((p) => s.startsWith(p));
		if (!prefix) return null;

		s = s.slice(prefix.length);

		// Flags must not contain separators.
		if (this.separators.some((p) => s.includes(p))) return null;

		// The flag must be an allowed one.
		if (this.allowedFlag(s)) return s;

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
		if (this.allowedOption(s)) return s;

		return null;
	}

	public matchCompactOption(s: string): [string, string] | null {
		const pre = this.prefixes.find((x) => s.startsWith(x));
		if (!pre) return null;

		s = s.slice(pre.length);
		const sep = this.separators.find((x) => s.includes(x));
		if (!sep) return null;

		const i = s.indexOf(sep);
		if (i + sep.length === s.length) return null;

		const k = s.slice(0, i);
		if (!this.allowedOption(k)) return null;

		const v = s.slice(i + sep.length);
		return [k, v];
	}

	private allowedFlag(s: string) {
		return (this.flags as readonly string[]).includes(s);
	}

	private allowedOption(s: string) {
		return (this.options as readonly string[]).includes(s);
	}
}
