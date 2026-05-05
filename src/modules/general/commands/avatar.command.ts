import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AvatarService } from "../services/avatar.service";

export default {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Mostra o avatar de um usuário")
		.addUserOption((option) =>
			option
				.setName("usuario")
				.setDescription("Usuário para ver o avatar")
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("usuario", false);

		const result = await AvatarService.execute(interaction, user);

		await interaction.reply(result);
	},
};