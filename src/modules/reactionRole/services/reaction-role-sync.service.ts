import { Guild, GuildMember, TextChannel } from "discord.js";
import logger from "../../../shared/utils/logger.util";
import { ReactionRoleStorageService } from "./reaction-role-storage.service";

type ScheduleParams = {
	guild: Guild;
	channelId: string;
	messageId: string;
	userId: string;
	emoji: string;
};

export class ReactionRoleSyncService {
	private static readonly DEBOUNCE_MS = 1_000;
	private static readonly timers = new Map<string, NodeJS.Timeout>();

	static schedule(params: ScheduleParams) {
		const key = this.createKey(params);
		const existingTimer = this.timers.get(key);

		if (existingTimer) clearTimeout(existingTimer);

		const timer = setTimeout(async () => {
			this.timers.delete(key);
			await this.sync(params);
		}, this.DEBOUNCE_MS);

		this.timers.set(key, timer);
	}

	private static async sync(params: ScheduleParams) {
		try {
			const guildId = params.guild.id;

			const config = ReactionRoleStorageService.findByReaction({ guildId, messageId: params.messageId, emoji: params.emoji });
			if (!config) return;

			const channel = await params.guild.channels.fetch(params.channelId).catch(() => null);
			if (!(channel instanceof TextChannel)) return;

			const message = await channel.messages.fetch(params.messageId).catch(() => null);
			if (!message) return;

			const member = await params.guild.members.fetch(params.userId).catch(() => null);
			if (!member || !(member instanceof GuildMember)) return;

			const reaction = message.reactions.cache.find((item) => item.emoji.toString() === params.emoji);

			let hasReaction = false;

			if (reaction) {
				const users = await reaction.users.fetch().catch(() => null);
				hasReaction = users?.has(params.userId) ?? false;
			}

			if (hasReaction) {
				await member.roles.add(config.roleId);
				logger.info(`Cargo ${config.roleId} sincronizado/adicionado para ${params.userId}.`);
				return;
			}

			await member.roles.remove(config.roleId);

			logger.info(`Cargo ${config.roleId} sincronizado/removido de ${params.userId}.`);
		} catch (error) {
			logger.error("Erro ao sincronizar reaction role.", error);
		}
	}

	private static createKey(params: ScheduleParams) {
		return [
			params.guild.id,
			params.channelId,
			params.messageId,
			params.userId,
			params.emoji,
		].join(":");
	}
}