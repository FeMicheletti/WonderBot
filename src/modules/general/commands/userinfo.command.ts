import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { UserInfoService } from "../services/userinfo.service";

export default {
	data: new SlashCommandBuilder()
		.setName("userinfo")
		.setDescription("Mostra informações sobre um usuário")
		.addUserOption((option) =>
			option
				.setName("usuario")
				.setDescription("Usuário para consultar")
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("usuario", false);

		const result = await UserInfoService.execute(interaction, user);

		await interaction.reply(result);
	},
};