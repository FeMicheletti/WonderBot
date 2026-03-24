import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Para a música, limpa a fila e sai da call"),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "Esse comando só pode ser usado em servidor.",
                ephemeral: true,
            });
            return;
        }

        MusicService.stop(interaction.guild.id);

        await interaction.reply("⏹️ Música parada e fila limpa.");
    },
};