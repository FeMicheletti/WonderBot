import { Events, Interaction, Client } from "discord.js";
import logger from "../shared/utils/logger.util";
import { AppError } from "../shared/errors/app.error";

export default {
    name: Events.InteractionCreate,
    once: false, 

    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = (interaction.client as Client & { commands: Map<string, any> }).commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Comando não encontrado: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error(`Erro ao executar o comando ${interaction.commandName}`, error);

            const message = error instanceof AppError ? error.message : 'Ocorreu um erro ao executar este comando.';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: message, ephemeral: true });
            } else {
                await interaction.reply({ content: message, ephemeral: true });
            }
        }
    },
};