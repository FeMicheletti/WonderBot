import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";

const packageJson = require("../../../../package.json");

export class BotInfoService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const client = interaction.client;

		const uptimeMs = client.uptime ?? 0;
		const totalSeconds = Math.floor(uptimeMs / 1000);

		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const memory = process.memoryUsage();

		const usedMb = Math.round(memory.rss / 1024 / 1024);
		const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
		const heapTotalMb = Math.round(memory.heapTotal / 1024 / 1024);

		const embed = new EmbedBuilder()
			.setTitle("🤖 Bot Info")
			.setColor(0x5865f2)
			.setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
			.addFields(
				{ name: "Nome", value: client.user?.tag ?? "Desconhecido", inline: true },
				{ name: "Versão", value: packageJson.version ?? "N/A", inline: true },
				{ name: "Node.js", value: process.version, inline: true },
				{ name: "Servidores", value: `${client.guilds.cache.size}`, inline: true },
				{ name: "Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
				{ name: "Memória", value: [ `RSS: **${usedMb} MB**`, `Heap: **${heapUsedMb}/${heapTotalMb} MB**` ].join("\n"), inline: false }
			);

		return { embeds: [embed] };
	}
}