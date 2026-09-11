import { ApplicationCommandOptionType, type ChatInputCommandInteraction, type CommandInteractionOption } from 'discord.js';
import { Option, Result } from '@sapphire/result';
import { type Parameter } from '@sapphire/lexure';

export class ChatInputParser {
	public used: Set<CommandInteractionOption> = new Set();

	public constructor(public interaction: ChatInputCommandInteraction) {}

	private get options(): readonly CommandInteractionOption[] {
		let { data } = this.interaction.options;
		if (data[0].type === ApplicationCommandOptionType.Subcommand) {
			data = data[0].options ?? [];
		}
		return data;
	}

	public get finished(): boolean {
		return this.used.size === this.options.length;
	}

	public reset(): void {
		this.used.clear();
	}

	public save(): Set<CommandInteractionOption> {
		return new Set(this.used);
	}

	public restore(state: Set<CommandInteractionOption>): void {
		this.used = state;
	}

	public async singleParseAsync<T, E>(
		name: string,
		predicate: (arg: CommandInteractionOption) => Promise<Result<T, E>>,
		useAnyways?: boolean
	): Promise<Result<T, E | null>> {
		if (this.finished) return Result.err(null);

		const option = this.options.find((option) => option.name === name);
		if (!option) return Result.err(null);

		const result = await predicate(option);
		if (result.isOk() || useAnyways) {
			this.used.add(option);
		}
		return result;
	}

	// TODO: This method doesn't really make sense for slash commands. Currently tries to convert CommandInteractionOptions back to strings. Any suggestions?
	public many(): Option<Parameter[]> {
		const parameters: Parameter[] = [];
		for (const option of this.options) {
			const keys = ['value', 'user', 'member', 'channel', 'role', 'attachment', 'message'] as const;
			let value = '';
			for (const key of keys) {
				const optionValue = option[key];
				if (optionValue) {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					value = optionValue.toString();
					break;
				}
			}

			parameters.push({ value, raw: value, separators: [], leading: '' });
		}

		return parameters.length === 0 ? Option.none : Option.some(parameters);
	}
}
