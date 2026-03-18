import { SlashCommandBuilder } from "discord.js";
import { PingService } from "../services/ping.service";

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Mostra a latência do bot'),

    async execute(interaction: any) {
        const sent = await interaction.reply({
            content: "Calculando ping...",
            fetchReply: true,
        });

        const result = PingService.execute({
            interactionCreatedTimestamp: interaction.createdTimestamp,
            replyCreatedTimestamp: sent.createdTimestamp,
            wsPing: interaction.client.ws.ping,
        });

        await interaction.editReply(result.message);
    },
};