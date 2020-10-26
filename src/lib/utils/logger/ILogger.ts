/**
 * The logger levels for the [[ILogger]].
 */
export const enum LogLevel {
	/**
	 * The lowest log level, used when calling [[ILogger.trace]].
	 */
	Trace = 10,

	/**
	 * The debug level, used when calling [[ILogger.debug]].
	 */
	Debug = 20,

	/**
	 * The info level, used when calling [[ILogger.info]].
	 */
	Info = 30,

	/**
	 * The warning level, used when calling [[ILogger.warn]].
	 */
	Warn = 40,

	/**
	 * The error level, used when calling [[ILogger.error]].
	 */
	Error = 50,

	/**
	 * The critical level, used when calling [[ILogger.fatal]].
	 */
	Fatal = 60,

	/**
	 * An unknown or uncategorized level.
	 */
	None = 100
}

export interface ILogger {
	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Trace]] as level.
	 * @param values The values to log.
	 */
	trace(...values: readonly unknown[]): void;

	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Debug]] as level.
	 * @param values The values to log.
	 */
	debug(...values: readonly unknown[]): void;

	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Info]] as level.
	 * @param values The values to log.
	 */
	info(...values: readonly unknown[]): void;

	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Warn]] as level.
	 * @param values The values to log.
	 */
	warn(...values: readonly unknown[]): void;

	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Error]] as level.
	 * @param values The values to log.
	 */
	error(...values: readonly unknown[]): void;

	/**
	 * Alias of [[ILogger.write]] with [[LogLevel.Fatal]] as level.
	 * @param values The values to log.
	 */
	fatal(...values: readonly unknown[]): void;

	/**
	 * Writes the log message given a level and the value(s).
	 * @param level The log level.
	 * @param values The values to log.
	 */
	write(level: LogLevel, ...values: readonly unknown[]): void;
}
