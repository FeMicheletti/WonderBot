import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { UptimeService } from "../services/uptime.service";

export default {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Mostra há quanto tempo o bot está online"),

	async execute(interaction: ChatInputCommandInteraction) {
		const result = await UptimeService.execute(interaction);

		await interaction.reply(result);
	},
};