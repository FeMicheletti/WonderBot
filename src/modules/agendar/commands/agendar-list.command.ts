import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { AgendarService } from "../services/agendar.service";

export default {
	data: new SlashCommandBuilder()
		.setName("agendar-list")
		.setDescription("Lista seus agendamentos e, se permitido, os do servidor"),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await AgendarService.list(interaction);
		await interaction.editReply(result);
	},
};