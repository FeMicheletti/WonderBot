import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { ReactionRoleSyncService } from "../modules/reactionRole/services/reaction-role-sync.service";

export default {
	name: "messageReactionRemove",

	async execute(reaction: MessageReaction | PartialMessageReaction,user: User | PartialUser) {
		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();
		if (user.partial) await user.fetch();

		const message = reaction.message;

		if (!message.guild) return;
		if (!message.channelId) return;

		const emoji = reaction.emoji.toString();

		ReactionRoleSyncService.schedule({
			guild: message.guild,
			channelId: message.channelId,
			messageId: message.id,
			userId: user.id,
			emoji,
		});
	}
};