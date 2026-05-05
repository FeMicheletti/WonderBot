import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CoinFlipService } from "../services/coinflip.service";

export default {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription("Joga cara ou coroa"),

	async execute(interaction: ChatInputCommandInteraction) {
		const result = await CoinFlipService.execute(interaction);

		await interaction.reply(result);
	},
};