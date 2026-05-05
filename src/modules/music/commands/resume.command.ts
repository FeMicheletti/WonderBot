import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Continua a música pausada"),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return interaction.reply({
            content: "Esse comando só pode ser usado em servidor.",
            flags: MessageFlags.Ephemeral
        });

		const result = await MusicService.resume(interaction.guild.id);

		await interaction.reply(result);
	},
};