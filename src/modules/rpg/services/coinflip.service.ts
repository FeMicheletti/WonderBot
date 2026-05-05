import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";

export class CoinFlipService {
	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionReplyOptions> {
		const result = Math.random() < 0.5 ? "Cara" : "Coroa";
		const emoji = result === "Cara" ? "🪙" : "👑";

		const embed = new EmbedBuilder()
			.setTitle("🪙 Cara ou coroa")
			.setDescription(`${emoji} Resultado: **${result}**`)
			.setColor(0x5865f2)
			.setFooter({
				text: `Pedido por ${interaction.user.username}`,
			});

		return { embeds: [embed] };
	}
}