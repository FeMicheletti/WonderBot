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
        await interaction.deferReply();

        if (!interaction.guild) {
            await interaction.reply({
                content: "Esse comando só pode ser usado em servidor.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const url = interaction.options.getString("url", true);

        const isYoutube = play.yt_validate(url) === "video";

        if (!isYoutube) {
            await interaction.reply({
                content: "Envie um link válido de vídeo do YouTube.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const video = await play.video_basic_info(url);

        const track = {
            title: video.video_details.title || "Unknown Title",
            url,
            requestedBy: interaction.user.username,
            duration: video.video_details.durationRaw,
            thumbnail: video.video_details.thumbnails?.[0]?.url,
        };

        const result = await MusicService.addTrack({
            guild: interaction.guild,
            member,
            track: track,
        });

        if (result.startedNow) {
            await interaction.reply(`🎵 Tocando agora: **${result.track.title}**`);
            return;
        }

        await interaction.reply(
            `📥 Adicionado à fila: **${result.track.title}** (posição ${result.position})`
        );
    },
};