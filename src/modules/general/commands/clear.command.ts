import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ClearService } from "../services/clear.service";

export default {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Apaga mensagens do canal atual")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de mensagens para apagar")
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(99)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const quantidade = interaction.options.getInteger("quantidade", true);

		const result = await ClearService.execute(quantidade, interaction);

		await interaction.editReply(result);
	},
};