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
	 * Constructs an UserError.
	 * @param type The identifier, useful to localize emitted errors.
	 * @param message The error message.
	 */
	public constructor(type: string, message: string) {
		super(message);
		this.name = 'UserError';
		this.identifier = type;
	}
}
