import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";

export class UptimeService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const uptimeMs = interaction.client.uptime ?? 0;

		const totalSeconds = Math.floor(uptimeMs / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const parts = [];

		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		parts.push(`${seconds}s`);

		const embed = new EmbedBuilder()
			.setTitle("⏱️ Bot uptime")
			.setDescription(`Online há **${parts.join(" ")}**.`)
			.setColor(0x5865f2);

		return { embeds: [embed] };
	}
}