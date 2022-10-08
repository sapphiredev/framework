/**
 * The UserError class to be emitted in the pieces.
 * @property name This will be `'UserError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class UserError extends Error {
	/**
	 * An identifier, useful to localize emitted errors.
	 */
	public readonly identifier: string;

	/**
	 * User-provided context.
	 */
	public readonly context: unknown;

	/**
	 * Constructs an UserError.
	 * @param type The identifier, useful to localize emitted errors.
	 * @param message The error message.
	 */
	public constructor(options: UserError.Options) {
		super(options.message);
		this.identifier = options.identifier;
		this.context = options.context ?? null;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public override get name(): string {
		return 'UserError';
	}
}

export namespace UserError {
	/**
	 * The options for {@link UserError}.
	 * @since 1.0.0
	 */
	export interface Options {
		/**
		 * The identifier for this error.
		 * @since 1.0.0
		 */
		identifier: string;

		/**
		 * The message to be passed to the Error constructor.
		 * @since 1.0.0
		 */
		message?: string;

		/**
		 * The extra context to provide more information about this error.
		 * @since 1.0.0
		 * @default null
		 */
		context?: unknown;
	}
}
