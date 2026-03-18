import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RollService } from "../services/roll.service";
import { RollDiceValidationError } from "../dto/roll.dto";

export default {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Rola dados no formato NdX (ex: 1d20, 2d6)")
        .addStringOption( (option) =>
            option
                .setName("dados")
                .setDescription("Formato do dado (ex: 1d20)")
                .setRequired(true) ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const expression = interaction.options.getString("dados", true);

            const result = RollService.execute({
                expression,
                username: interaction.user.username,
            });

            await interaction.reply(result.message);
        } catch (error) {
            if (error instanceof RollDiceValidationError) {
                await interaction.reply({ content: error.message, ephemeral: true, });
                return;
            }
            throw error;
        }
    },
};