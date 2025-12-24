import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';
import type { ApplicationCommand, Collection, Snowflake } from 'discord.js';

export class CoreListener extends Listener<typeof Events.ApplicationCommandRegistriesBulkOverwrite> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.ApplicationCommandRegistriesBulkOverwrite });
	}

	public run(result: Collection<Snowflake, ApplicationCommand>, guildId: string | null) {
		if (guildId) {
			this.container.logger.info(
				`ApplicationCommandRegistries(BulkOverwrite) Successfully overwrote guild application commands for guild ${guildId}. The application now has ${result.size} guild commands for guild ${guildId}`
			);
		} else {
			this.container.logger.info(
				`ApplicationCommandRegistries(BulkOverwrite) Successfully overwrote global application commands. The application now has ${result.size} global commands`
			);
		}
	}
}
