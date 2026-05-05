import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { MusicService } from "../../music/services/music.service";

export class HealthService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const client = interaction.client;

		const wsPing = client.ws.ping;
		const isReady = client.isReady();

		const musicHealth = MusicService.getHealthStatus();

		const embed = new EmbedBuilder()
			.setTitle("🩺 Bot Health")
			.setColor(isReady ? 0x57f287 : 0xed4245)
			.addFields(
				{
					name: "Discord",
					value: [
						`Ready: **${isReady ? "Sim" : "Não"}**`,
						`WebSocket Ping: **${wsPing}ms**`,
						`Guilds: **${client.guilds.cache.size}**`,
					].join("\n"),
					inline: false,
				},
				{
					name: "Música",
					value: [
						`Sessões ativas: **${musicHealth.activeSessions}**`,
						`Tocando: **${musicHealth.playingSessions}**`,
						`Pausadas: **${musicHealth.pausedSessions}**`,
						`Músicas em fila: **${musicHealth.totalQueuedTracks}**`,
					].join("\n"),
					inline: false,
				}
			);

		if (musicHealth.sessions.length > 0) {
			const sessionsText = musicHealth.sessions
				.slice(0, 5)
				.map((session) => {
					return [
						`Guild: \`${session.guildId}\``,
						`Tocando: **${session.currentTrack ?? "Nada"}**`,
						`Fila: **${session.upcomingLength}**`,
						`Paused: **${session.isPaused ? "Sim" : "Não"}**`,
						`Loop: **${session.loopCurrent ? "Sim" : "Não"}**`,
					].join("\n");
				})
				.join("\n\n");

			embed.addFields({
				name: "Sessões de música",
				value: sessionsText,
				inline: false,
			});
		}

		return { embeds: [embed] };
	}
}