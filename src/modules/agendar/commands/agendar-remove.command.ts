import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { AgendarService } from "../services/agendar.service";

export default {
	data: new SlashCommandBuilder()
		.setName("agendar-remove")
		.setDescription("Remove um agendamento")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID do agendamento")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const result = await AgendarService.remove(interaction);
		await interaction.editReply(result);
	},
};