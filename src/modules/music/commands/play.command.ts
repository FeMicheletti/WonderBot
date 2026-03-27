import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, } from "discord.js";
import { MusicService } from "../services/music.service";
import logger from "../../../shared/utils/logger.util";

export default {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Toca uma música por link")
		.addStringOption((option) =>
			option
				.setName("url")
				.setDescription("Link do YouTube")
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return interaction.reply({
			content: "Esse comando só pode ser usado em servidor.",
			flags: MessageFlags.Ephemeral,
		});

		await interaction.deferReply();

		try {
			const member = await interaction.guild.members.fetch(interaction.user.id);
			const url = interaction.options.getString("url", true);

			const result = await MusicService.play(member, url, interaction);
			return interaction.editReply(result);
		} catch (error) {
			logger.error("Erro ao executar comando /play:", error);
			return interaction.editReply("Não consegui tocar essa música.");
		}
	},
};