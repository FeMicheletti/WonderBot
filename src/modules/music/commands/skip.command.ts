import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pula a música atual"),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "Esse comando só pode ser usado em servidor.",
                ephemeral: true,
            });
            return;
        }

        const result = MusicService.skip(interaction.guild.id);

        await interaction.reply(`⏭️ Pulando: **${result.skippedTrack.title}**`);
    },
};