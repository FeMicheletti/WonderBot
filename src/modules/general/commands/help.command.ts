import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { HelpService } from "../services/help.service";

export default {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Mostra a lista de comandos disponíveis"),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const result = await HelpService.execute(interaction);

		await interaction.editReply(result);
	},
};