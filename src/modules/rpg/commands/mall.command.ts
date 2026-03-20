import { SlashCommandBuilder } from "discord.js";
import { MallService } from "../services/mall.service";

export default {
    data: new SlashCommandBuilder().setName('mall').setDescription('Comando para acessar a loja do RPG'),

    async execute(interaction: any) {
        await interaction.reply({
            content: "Carregando loja...",
            fetchReply: true,
        });

        const embed = await MallService.execute();

        await interaction.editReply({ embeds: [ embed ], content: "" });
    },
};

