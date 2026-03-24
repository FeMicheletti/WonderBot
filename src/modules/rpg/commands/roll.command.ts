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
                .setRequired(true) )
        .addBooleanOption( (option) =>
            option
                .setName("secreto")
                .setDescription("Rolar o dado de forma secreta")
                .setRequired(false) ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const expression = interaction.options.getString("dados", true);
            const secret = interaction.options.getBoolean("secreto", false) || false;

            const result = RollService.execute({
                expression,
                username: interaction.user.username,
            });

            if (secret) {
                await interaction.reply({ content: "🎲 Você rolou os dados... o destino decidiu."});
                await RollService.sendRollToGM(interaction, result);
            } else {
                await interaction.reply(result.message);
            }
        } catch (error) {
            if (error instanceof RollDiceValidationError) {
                await interaction.reply({ content: error.message, ephemeral: true, });
                return;
            }
            throw error;
        }
    },
};