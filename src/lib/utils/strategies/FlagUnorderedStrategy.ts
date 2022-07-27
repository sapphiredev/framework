import { PrefixedStrategy } from '@sapphire/lexure';
import { Option } from '@sapphire/result';

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

const never = () => Option.none;
const always = () => true;

export class FlagUnorderedStrategy extends PrefixedStrategy {
	public readonly flags: readonly string[] | true;
	public readonly options: readonly string[] | true;

	public constructor({ flags, options, prefixes = ['--', '-', '—'], separators = ['=', ':'] }: FlagStrategyOptions = {}) {
		super(prefixes, separators);
		this.flags = flags || [];
		this.options = options || [];

		if (this.flags === true) this.allowedFlag = always;
		else if (this.flags.length === 0) this.matchFlag = never;

		if (this.options === true) {
			this.allowedOption = always;
		} else if (this.options.length === 0) {
			this.matchOption = never;
			this.matchCompactOption = never;
		}
	}

	public matchFlag(s: string): Option<string> {
		const result = super.matchFlag(s);

		// The flag must be an allowed one.
		if (result.isSomeAnd((value) => this.allowedFlag(value))) return result;

		// If it did not match a flag, return null.
		return Option.none;
	}

	public matchOption(s: string): Option<readonly [key: string, value: string]> {
		const result = super.matchOption(s);

		if (result.isSomeAnd((option) => this.allowedOption(option[0]))) return result;

		return Option.none;
	}

	public matchCompactOption(s: string): Option<readonly [key: string, value: string]> {
		const pre = this.prefixes.find((x) => s.startsWith(x));
		if (!pre) return Option.none;

		s = s.slice(pre.length);
		const sep = this.separators.find((x) => s.includes(x));
		if (!sep) return Option.none;

		const i = s.indexOf(sep);
		if (i + sep.length === s.length) return Option.none;

		const k = s.slice(0, i);
		if (!this.allowedOption(k)) return Option.none;

		const v = s.slice(i + sep.length);
		return Option.some([k, v] as const);
	}

	private allowedFlag(s: string) {
		return (this.flags as readonly string[]).includes(s);
	}

	private allowedOption(s: string) {
		return (this.options as readonly string[]).includes(s);
	}
}
