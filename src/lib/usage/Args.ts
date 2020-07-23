import { regExpEsc } from '@klasa/utils';

const enum Quote {
	Single = "''",
	Double = '""',
	SmartSingle = '‘’',
	SmartDouble = '“”'
}

const enum Dash {
	Single = '-',
	Double = '--',
	Long = '—'
}

const kQuote = [Quote.Single[0], Quote.Double[0], Quote.SmartSingle[0], Quote.SmartDouble[0]];
const kDashThin = [Dash.Single, Dash.Long].join('|');
const kDashWide = [Dash.Double, Dash.Long].join('|');

export class Flag {
	public readonly kDash: Dash;
	public readonly kName: string;
	public readonly kValue: string | null;
	public readonly kIndex: number;

	public constructor(dash: Dash, name: string, value: string | null, index: number) {
		this.kDash = dash;
		this.kName = name.toLowerCase();
		this.kValue = value;
		this.kIndex = index;
	}

	public get length() {
		return this.kValue === null ? this.kName.length : this.kName.length + this.kValue.length;
	}

	public get fullLength() {
		return this.kDash.length + this.length;
	}

	public get offset() {
		return this.kIndex + this.fullLength;
	}

	public static make(options: readonly string[]): RegExp | null {
		if (options.length === 0) return null;

		// Escape and separate both parts
		const wide: string[] = [];
		const thin: string[] = [];
		for (const option of options) {
			if (option.length === 0) continue;

			const escaped = regExpEsc(option);
			if (option.length === 1) thin.push(escaped);
			else wide.push(escaped);
		}

		// Generate the RegExp for both parts:
		const widePath = wide.length === 0 ? null : `(${kDashWide})(${wide.join('|')})(=|\\s|$)`;
		const thinPath = thin.length === 0 ? null : `(${kDashThin})(${thin.join('|')})(?=\\s|$)`;

		// Concatenate both parts:
		// (?, ?):
		//   (string, ?):
		//     - (string, string): -> wide + thin
		//     - (string, null): -> wide
		//   (null, ?):
		//     - (null, string): -> thin
		//     - (null, null): -> null
		const mixed = widePath ? (thinPath ? `(?:${widePath}|${thinPath})` : widePath) : thinPath ? thinPath : null;

		if (mixed === null) return mixed;

		return new RegExp(`\B${mixed}`, 'ig');
	}

	/**
	 *
	 * @param content The content to parse
	 * @param allowedFlags The regexp with the allowed flags
	 * @example
	 * const content = '--hello=world --wow —Hi';
	 * const allowedFlags = Args.makeFlags(['hello', 'hi', 'i']);
	 * // -> /\B(?:(--|—)(hello|hi)(=|\s|$)|(-|—)(i)(?=\s|$))/ig
	 *
	 * for (const flag of Flag.getPotentialFlags(content, allowedFlags)) {
	 *   console.log(flag);
	 *   // Flag {
	 *   //   kDash: '--',
	 *   //   kName: 'hello',
	 *   //   kValue: 'world',
	 *   //   kIndex: 0 }
	 *   //
	 *   // Flag {
	 *   //   kDash: '—',
	 *   //   kName: 'hi',
	 *   //   kValue: null,
	 *   //   kIndex: 20 }
	 * }
	 */
	public static *parse(content: string, allowedFlags: RegExp) {
		let match: RegExpExecArray | null = null;
		while ((match = allowedFlags.exec(content))) {
			// Single-dash
			if (match[4] === undefined) {
				yield new Flag(match[4] as Dash, match[5], null, match.index);
				continue;
			}

			const dash = match[1] as Dash;
			const name = match[2];
			if (match[3] === '=') {
				yield new Flag(dash, name, null, match.index);
				continue;
			}

			yield new Flag(dash, name, null, match.index);
		}
	}
}

export class Args {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#content: string;
	// TODO(kyranet): make this a Cache
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#flags = new Map<string, Flag>();

	public constructor(content: string) {
		this.#content = content;
	}

	private static get(content: string, allowQuotes: boolean) {
		const quoted = kQuote.includes(content[0]);
		return quoted ? (allowQuotes ? Args.getQuoted(content.substring(1)) : null) : Args.getSimple(content);
	}

	private static getSimple(content: string): string | null {
		return content;
	}

	private static getQuoted(content: string): string | null {
		return content;
	}

	private static findQuoteEnd(parameter: string, quote: Quote): number {
		const closing = quote[1];

		let i = 0;
		let escaped = false;
		for (const character of parameter) {
			if (character === '\\') escaped = !escaped;
			else if (character === closing) return i;
			i += character.length;
		}

		return -1;
	}
}
