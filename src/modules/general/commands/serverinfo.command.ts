import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { ServerInfoService } from "../services/serverinfo.service";

export default {
	data: new SlashCommandBuilder()
		.setName("serverinfo")
		.setDescription("Mostra informações sobre o servidor"),

	async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply({
            content: "Esse comando só pode ser usado em servidor.",
            flags: MessageFlags.Ephemeral
        });

		const result = await ServerInfoService.execute(interaction);

		await interaction.reply(result);
	},
};