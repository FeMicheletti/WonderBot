import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Para a música, limpa a fila e sai da call"),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply({
            content: "Esse comando só pode ser usado em servidor.",
            flags: MessageFlags.Ephemeral
        });

        const result = await MusicService.stop(interaction.guild.id);

        await interaction.reply(result);
    },
};