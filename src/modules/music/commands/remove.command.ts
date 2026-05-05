import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove uma música da fila")
		.addIntegerOption((option) =>
			option
				.setName("posicao")
				.setDescription("Posição da música na fila")
				.setRequired(true)
				.setMinValue(1)
		),

	async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply({
            content: "Esse comando só pode ser usado em servidor.",
            flags: MessageFlags.Ephemeral
        });

		const position = interaction.options.getInteger("posicao", true);

		const result = await MusicService.remove(interaction.guild.id, position);

		await interaction.reply(result);
	},
};