import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { InviteService } from "../services/invite.service";

export default {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Gera o link de convite do bot"),

	async execute(interaction: ChatInputCommandInteraction) {
		const result = await InviteService.execute(interaction);

		await interaction.reply(result);
	},
};