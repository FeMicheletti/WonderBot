import { Events, Interaction, Client } from "discord.js";
import logger from "../shared/utils/logger.util";
import { AppError } from "../shared/errors/app.error";

export default {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction: Interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = (interaction.client as Client & { commands: Map<string, any> }).commands.get(interaction.commandName);

                if (!command) return logger.warn(`Comando não encontrado: ${interaction.commandName}`);

                return await command.execute(interaction);
            }

            if (interaction.isStringSelectMenu()) {
                //* Adicionar aqui eventos de respostas
                return;
            }
        } catch (error) {
            logger.error("Erro ao processar interação", error);

            const message = error instanceof AppError ? error.message : "Ocorreu um erro ao processar esta interação.";

            if (interaction.isRepliable()) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: message, ephemeral: true });
                } else {
                    await interaction.reply({ content: message, ephemeral: true });
                }
            }
        }
    },
};