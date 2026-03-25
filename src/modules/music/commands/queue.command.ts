import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Mostra a fila de músicas"),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply({
            content: "Esse comando só pode ser usado em servidor.",
            flags: MessageFlags.Ephemeral
        });

        const result = await MusicService.queue(interaction.guild.id);

        await interaction.reply(result);
    },
};