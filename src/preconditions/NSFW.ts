import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning `false`.
		return Reflect.get(message.channel, 'nsfw') === true
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionNSFW, message: 'You cannot run this message command outside NSFW channels.' });
	}

	public async chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning `false`.
		return Reflect.get(channel, 'nsfw') === true
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionNSFW, message: 'You cannot run this chat input command outside NSFW channels.' });
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		// `nsfw` is undefined in DMChannel, doing `=== true`
		// will result on it returning `false`.
		return Reflect.get(channel, 'nsfw') === true
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionNSFW, message: 'You cannot run this command outside NSFW channels.' });
	}
}
