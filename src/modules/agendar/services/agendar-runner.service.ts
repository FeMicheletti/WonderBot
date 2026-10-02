import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, TextChannel } from "discord.js";
import logger from "../../../shared/utils/logger.util";
import { AgendarStorageService } from "./agendar-storage.service";
import { AgendarTimeService } from "./agendar-time.service";
import { AgendamentoConfig } from "../interfaces/agendar.interface";

export class AgendarRunnerService {
	private static interval: NodeJS.Timeout | null = null;

	static start(client: Client) {
		if (this.interval) return;

		this.interval = setInterval(() => {
			this.tick(client);
		}, 30_000);

		logger.info("AgendarRunnerService iniciado.");
	}

	private static async tick(client: Client) {
		await this.processSchedules(client);
		await this.processSnoozes(client);
	}

	private static async processSchedules(client: Client) {
		const schedules = AgendarStorageService.getSchedules();
		const now = new Date();

		const currentHour = AgendarTimeService.getHourMinute(now);
		const runKey = AgendarTimeService.getRunKey(now);

		for (const schedule of schedules) {
			if (!schedule.enabled) continue;
			if (schedule.hour !== currentHour) continue;
			if (schedule.lastRunKey === runKey) continue;

			await this.sendSchedule(client, schedule);

			AgendarStorageService.updateSchedule({ ...schedule, lastRunKey: runKey });
		}
	}

	private static async sendSchedule(client: Client, schedule: AgendamentoConfig) {
		if (schedule.type === "server") {
			if (!schedule.guildId || !schedule.channelId) return;

			const channel = await client.channels.fetch(schedule.channelId).catch(() => null);

			if (!(channel instanceof TextChannel)) return;

			const mention = schedule.roleId ? `<@&${schedule.roleId}>` : "";

			await channel.send({
				content: mention,
				embeds: [this.createReminderEmbed(schedule)],
				components: [this.createSnoozeRow(schedule.id)],
			});

			return;
		}

		if (schedule.type === "personal") {
			if (!schedule.userId) return;

			const user = await client.users.fetch(schedule.userId).catch(() => null);

			if (!user) return;

			await user.send({
				embeds: [this.createReminderEmbed(schedule)],
				components: [this.createSnoozeRow(schedule.id)],
			});
		}
	}

	private static async processSnoozes(client: Client) {
		const snoozes = AgendarStorageService.getSnoozes();
		const now = Date.now();

		for (const snooze of snoozes) {
			if (snooze.done) continue;

			const remindAt = new Date(snooze.remindAt).getTime();
			if (remindAt > now) continue;

            const user = await client.users.fetch(snooze.userId).catch(() => null);
			if (user) {
				await user.send({
					embeds: [
						new EmbedBuilder()
							.setTitle("⏰ Lembrete adiado")
							.setDescription(snooze.message)
							.setColor(0x5865f2)
							.setTimestamp(),
					],
				});
			}

			AgendarStorageService.markSnoozeDone(snooze.id);
		}
	}

	private static createReminderEmbed(schedule: AgendamentoConfig) {
		return new EmbedBuilder()
			.setTitle("⏰ Lembrete")
			.setDescription(schedule.message)
			.setColor(0x5865f2)
			.setFooter({
				text: `Agendamento ID: ${schedule.id}`,
			})
			.setTimestamp();
	}

	private static createSnoozeRow(scheduleId: string) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`agendar:snooze:${scheduleId}`)
				.setLabel("Adiar para mim")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("⏰")
		);
	}
}