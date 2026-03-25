import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { MusicService } from "../services/music.service";
import play from "play-dl";

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
            flags: MessageFlags.Ephemeral
        });

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const url = interaction.options.getString("url", true);

        const result = await MusicService.play(member, url, interaction);

        return interaction.reply(result);
    },
};