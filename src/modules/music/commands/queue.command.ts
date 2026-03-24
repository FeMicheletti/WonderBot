import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { MusicService } from "../services/music.service";

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Mostra a fila de músicas"),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "Esse comando só pode ser usado em servidor.",
                ephemeral: true,
            });
            return;
        }

        const { currentTrack, queue } = MusicService.getQueue(interaction.guild.id);

        if (!currentTrack && queue.length === 0) {
            await interaction.reply("📭 A fila está vazia.");
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("🎶 Fila de músicas")
            .setDescription(
                currentTrack
                    ? `**Tocando agora:** ${currentTrack.title}\nPedido por: ${currentTrack.requestedBy}`
                    : "Nada tocando no momento."
            )
            .addFields({
                name: "Próximas",
                value:
                    queue.length > 0
                        ? queue.map((track, index) =>`${index + 1}. **${track.title}** — pedido por ${track.requestedBy}`).join("\n") 
                        : "Nenhuma música na fila.",
            });

        await interaction.reply({ embeds: [embed] });
    },
};